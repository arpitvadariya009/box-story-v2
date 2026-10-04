const GiftSelection = require('../models/GiftSelection');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Catalogue = require('../models/Catalogue');

// @desc    Get gift selections
// @route   GET /api/gift-selections
// @access  Private
const getGiftSelections = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'CorporateHRManager') {
      query.client = req.user.client;
    } else if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    }

    const selections = await GiftSelection.find(query)
      .populate('employee', 'name email employeeId department')
      .populate('client', 'companyName')
      .populate('catalogue', 'name theme budget')
      .populate('selectedProducts.product', 'name sku basePrice images');

    res.json(selections);
  } catch (error) {
    next(error);
  }
};

// @desc    Get gift selection details
// @route   GET /api/gift-selections/:id
// @access  Private
const getGiftSelectionById = async (req, res, next) => {
  try {
    const selection = await GiftSelection.findById(req.params.id)
      .populate('employee')
      .populate('client')
      .populate('catalogue')
      .populate('selectedProducts.product');

    if (!selection) {
      res.status(404);
      throw new Error('Gift Selection record not found');
    }

    // Role verification
    if (req.user.role === 'CorporateHRManager' && req.user.client.toString() !== selection.client.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this gift selection');
    }

    if (req.user.role === 'Employee' && req.user._id.toString() !== selection.employee.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this gift selection');
    }

    res.json(selection);
  } catch (error) {
    next(error);
  }
};

// @desc    Employee saves / submits gift selections from catalogue
// @route   POST /api/gift-selections
// @access  Private/Employee
const submitGiftSelection = async (req, res, next) => {
  try {
    const { catalogueId, selectedProducts, occasion, giftMessage, deliveryAddress } = req.body;

    const catalogue = await Catalogue.findById(catalogueId);
    if (!catalogue) {
      res.status(404);
      throw new Error('Curated Gift Catalogue not found');
    }

    let totalValue = 0;
    const finalItems = [];

    for (const item of selectedProducts) {
      const catProd = catalogue.products.find(p => p.product.toString() === item.product.toString());
      if (!catProd) {
        res.status(400);
        throw new Error(`Product ${item.product} is not part of this curated catalogue`);
      }
      
      const productObj = await Product.findById(item.product);
      totalValue += catProd.clientPrice * (item.quantity || 1);
      finalItems.push({
        product: item.product,
        quantity: item.quantity || 1,
        personalization: item.personalization || '',
      });
    }

    // Check budget allocation constraints
    if (catalogue.budget > 0 && totalValue > catalogue.budget) {
      res.status(400);
      throw new Error(`Total selection value exceeds the HR budget limit of $${catalogue.budget}`);
    }

    const selection = await GiftSelection.create({
      employee: req.user._id,
      client: req.user.client,
      catalogue: catalogueId,
      selectedProducts: finalItems,
      budget: catalogue.budget,
      totalValue,
      occasion: occasion || 'Other',
      giftMessage: giftMessage || '',
      deliveryAddress,
      status: 'Selected',
    });

    res.status(201).json(selection);
  } catch (error) {
    next(error);
  }
};

// @desc    HR Manager approves employee gift selection
// @route   PUT /api/gift-selections/:id/approve
// @access  Private/HRManager
const approveGiftSelection = async (req, res, next) => {
  try {
    const selection = await GiftSelection.findById(req.params.id);

    if (!selection) {
      res.status(404);
      throw new Error('Gift Selection record not found');
    }

    if (req.user.role !== 'CorporateHRManager' || req.user.client.toString() !== selection.client.toString()) {
      res.status(403);
      throw new Error('Only B2B client HR managers can approve gift selections');
    }

    selection.status = 'Approved by HR';
    selection.approvedBy = req.user._id;
    selection.approvedAt = new Date();

    const updatedSelection = await selection.save();
    res.json(updatedSelection);
  } catch (error) {
    next(error);
  }
};

// @desc    HR Manager batch-converts approved selections into an executive Order
// @route   POST /api/gift-selections/order
// @access  Private/HRManager
const convertSelectionsToOrder = async (req, res, next) => {
  try {
    const { selectionIds, shippingAddress } = req.body;

    const selections = await GiftSelection.find({
      _id: { $in: selectionIds },
      client: req.user.client,
      status: 'Approved by HR',
    }).populate('selectedProducts.product');

    if (selections.length === 0) {
      res.status(400);
      throw new Error('No approved gift selections found for the provided IDs');
    }

    // Consolidate selection items into order items
    const orderItemsMap = {};
    for (const sel of selections) {
      for (const item of sel.selectedProducts) {
        const prodId = item.product._id.toString();
        if (orderItemsMap[prodId]) {
          orderItemsMap[prodId].quantity += item.quantity;
        } else {
          orderItemsMap[prodId] = {
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.basePrice, // default fallback, ideally fetch client price
          };
        }
      }
    }

    const consolidatedItems = Object.values(orderItemsMap);
    let subtotal = 0;
    consolidatedItems.forEach(i => {
      subtotal += i.price * i.quantity;
    });

    const tax = subtotal * 0.18;
    const totalAmount = subtotal + tax;

    const orderNumber = `ORD-GIFT-${Date.now().toString().slice(-6)}`;
    const order = await Order.create({
      orderNumber,
      client: req.user.client,
      orderedBy: req.user._id,
      items: consolidatedItems,
      subtotal,
      tax,
      totalAmount,
      shippingAddress,
      status: 'Pending Approval',
    });

    // Link selections back to this corporate Order
    for (const sel of selections) {
      sel.status = 'Ordered';
      sel.order = order._id;
      await sel.save();
    }

    res.status(201).json({ order, updatedSelections: selections.length });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGiftSelections,
  getGiftSelectionById,
  submitGiftSelection,
  approveGiftSelection,
  convertSelectionsToOrder,
};
