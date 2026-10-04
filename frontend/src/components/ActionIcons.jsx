import React from 'react';

/**
 * Custom Action Icons matching user-provided designs:
 * - ViewIcon: Styled eye with centered pupil
 * - EditIcon: Diagonal pen with baseline notch
 * - DeleteIcon: Trash can with top handle and dual internal slots
 */

export const ViewIcon = ({ size = 16, className = '', strokeWidth = 2, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

export const EditIcon = ({ size = 16, className = '', strokeWidth = 2, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 18.5l-4 1 1-4L16.5 3.5z" />
    <path d="M15 5l3 3" />
    <path d="M14 21h7" />
  </svg>
);

export const DeleteIcon = ({ size = 16, className = '', strokeWidth = 2, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1z" />
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default {
  ViewIcon,
  EditIcon,
  DeleteIcon,
};
