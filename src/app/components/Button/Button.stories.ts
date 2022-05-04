import React, { useState } from 'react';

import { ComponentMeta } from '@storybook/react';
import Button, { } from './Button';

export const Primary = () => {
	// Sets the hooks for both the label and primary props
	const [value, setValue] = useState('Secondary');
	const [isPrimary, setIsPrimary] = useState(false);

	export default {
		title: 'Button',
		component: Button,
	};

	const handleOnChange = () => {
		if (!isPrimary) {
			setIsPrimary(true);
			setValue('Primary');
		}
	};
	return <Button primary={ isPrimary } onClick = { handleOnChange } label = { value } />;
};