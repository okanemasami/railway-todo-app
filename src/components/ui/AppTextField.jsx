import React, { forwardRef } from 'react';

export const AppTextField = forwardRef(function AppTextField(props, ref) {
  const { className = '', multiline = false, ...rest } = props;
  const mergedClassName = ['app_input', className].filter(Boolean).join(' ');
  if (multiline) {
    return React.createElement('textarea', { ref, className: mergedClassName, ...rest });
  }
  return React.createElement('input', { ref, className: mergedClassName, ...rest });
});


