import React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import ProfileInfoForm from './ProfileInfoForm';
import { DEFAULT_SUBMIT_TEXT } from './constants';
import { ProfileInfoValues } from './types';

export default { title: 'Profile Information Form' };

export const base = (
  onSubmit: (profileInfo: ProfileInfoValues) => void = action('onSubmit'),
) => <ProfileInfoForm onSubmit={onSubmit} submitText={'Submit'} />;

export const playground = () => {
  const submitText = text('Submit Button Text', DEFAULT_SUBMIT_TEXT);
  return (
    <ProfileInfoForm onSubmit={action('onSubmit')} submitText={submitText} />
  );
};
playground.story = {
  decorators: [withKnobs],
};
