import React from 'react';
import useConfirm from '../hooks/useConfirm';
import Button from './Button';
import Heading from './Heading';
import Modal from './Modal';
import Box from './Box';
import Text from './Text';
import Checkbox from './Checkbox';
import Label from './Label';

const ConfirmDialog = () => {
    const {onConfirm, onCancel, confirmState} = useConfirm();
    const [chosen, setChosen] = React.useState([]);

    const toggleChosen = (id) => {
        const index = chosen.indexOf(id);
        if (index === -1) {
            setChosen([...chosen, id]);
        } else {
            setChosen(chosen.filter((item) => item !== id));
        }
    };

    const confirmButton = React.useRef(null);

    React.useEffect(() => {
        setTimeout(() => {
            if (confirmState.choices) setChosen(confirmState.choices.filter((c) => c.enabled).map((c) => c.key));
            if (confirmButton.current) {
                confirmButton.current.focus();
            }
        }, 50);
    }, [confirmState.show, confirmButton, confirmState.choices]);

    return confirmState.show ? (
        <Modal isOpen close={onCancel}>
            <form onSubmit={() => onConfirm(chosen)} className="flex justify-center flex-col text-center space-y-4">
                <Box css={{gap: '$4', flexDirection: 'column'}}>
                    <Box css={{gap: '$2', flexDirection: 'column'}}>
                        <Heading>{confirmState?.text && confirmState.text}</Heading>
                        {confirmState?.description && (
                            <Text css={{color: '$textMuted'}}>{confirmState.description}</Text>
                        )}
                    </Box>
                    {confirmState?.choices && (
                        <Box css={{flexDirection: 'column', alignItems: 'start', gap: '$2'}}>
                            {confirmState.choices.map((choice) => (
                                <Box css={{alignItems: 'center', flexDirection: 'row'}} key={choice.key}>
                                    <Checkbox
                                        checked={chosen.includes(choice.key)}
                                        defaultChecked={choice.enabled}
                                        id={choice.key}
                                        onCheckedChange={() => toggleChosen(choice.key)}
                                    />
                                    <Label css={{paddingLeft: '$3'}} htmlFor={choice.key}>
                                        {choice.label}
                                    </Label>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
                <Box css={{gap: '$3', justifyContent: 'space-between'}}>
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" buttonRef={confirmButton}>
                        {confirmState?.confirmAction}
                    </Button>
                </Box>
            </form>
        </Modal>
    ) : null;
};
export default ConfirmDialog;
