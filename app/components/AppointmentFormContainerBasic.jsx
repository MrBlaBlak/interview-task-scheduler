import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Create from '@mui/icons-material/Create';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Close from '@mui/icons-material/Close';
import LocationOn from '@mui/icons-material/LocationOn';
import Notes from '@mui/icons-material/Notes';
import { AppointmentForm } from '@devexpress/dx-react-scheduler-material-ui';

const PREFIX = 'Demo';
const classes = {
    content: `${PREFIX}-content`,
    header: `${PREFIX}-header`,
    closeButton: `${PREFIX}-closeButton`,
    buttonGroup: `${PREFIX}-buttonGroup`,
    button: `${PREFIX}-button`,
    picker: `${PREFIX}-picker`,
    wrapper: `${PREFIX}-wrapper`,
    icon: `${PREFIX}-icon`,
    textField: `${PREFIX}-textField`,
    addButton: `${PREFIX}-addButton`,
};

const StyledDiv = styled('div')(({ theme }) => ({
    [`& .${classes.icon}`]: {
        margin: theme.spacing(2, 0),
        marginRight: theme.spacing(2),
    },
    [`& .${classes.header}`]: {
        overflow: 'hidden',
        paddingTop: theme.spacing(0.5),
    },
    [`& .${classes.textField}`]: {
        width: '100%',
    },
    [`& .${classes.content}`]: {
        padding: theme.spacing(2),
        paddingTop: 0,
    },
    [`& .${classes.closeButton}`]: {
        float: 'right',
    },
    [`& .${classes.picker}`]: {
        marginRight: theme.spacing(2),
        '&:last-child': {
            marginRight: 0,
        },
        width: '50%',
    },
    [`& .${classes.wrapper}`]: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1, 0),
    },
    [`& .${classes.buttonGroup}`]: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 2),
    },
    [`& .${classes.button}`]: {
        marginLeft: theme.spacing(2),
    },
}));

const AppointmentFormContainerBasic = ({
                                           visible,
                                           visibleChange,
                                           appointmentData,
                                           cancelAppointment,
                                           target,
                                           onHide,
                                           commitChanges
                                       }) => {
    const [appointmentChanges, setAppointmentChanges] = useState({});

    const getAppointmentData = () => appointmentData;
    const getAppointmentChanges = () => appointmentChanges;

    const changeAppointment = ({ field, changes }) => {
        setAppointmentChanges(prev => ({
            ...prev,
            [field]: changes,
        }));
    };

    const commitAppointment = (type) => {
        const appointment = {
            ...getAppointmentData(),
            ...getAppointmentChanges(),
        };
        if (type === 'deleted') {
            commitChanges({ [type]: appointment.id });
        } else if (type === 'changed') {
            commitChanges({ [type]: { [appointment.id]: appointment } });
        } else {
            commitChanges({ [type]: appointment });
        }
        setAppointmentChanges({});
    };

    const displayAppointmentData = {
        ...appointmentData,
        ...appointmentChanges,
    };

    const isNewAppointment = appointmentData.id === undefined;
    const applyChanges = isNewAppointment
        ? () => commitAppointment('added')
        : () => commitAppointment('changed');

    const textEditorProps = (field) => ({
        variant: 'outlined',
        onChange: ({ target: change }) => changeAppointment({
            field: [field], changes: change.value,
        }),
        value: displayAppointmentData[field] || '',
        label: field[0].toUpperCase() + field.slice(1),
        className: classes.textField,
    });

    const pickerEditorProps = (field) => ({
        value: displayAppointmentData[field],
        onChange: (date) => changeAppointment({
            field: [field], changes: date ? date.toDate() : new Date(displayAppointmentData[field]),
        }),
        ampm: false,
        inputFormat: 'DD/MM/YYYY HH:mm',
        onError: () => null,
    });

    const startDatePickerProps = pickerEditorProps('startDate');
    const endDatePickerProps = pickerEditorProps('endDate');

    const cancelChanges = () => {
        setAppointmentChanges({});
        visibleChange();
        cancelAppointment();
    };

    return (
        <AppointmentForm.Overlay
            visible={visible}
            target={target}
            fullSize
            onHide={onHide}
        >
            <StyledDiv>
                <div className={classes.header}>
                    <IconButton className={classes.closeButton} onClick={cancelChanges} size="large">
                        <Close color="action" />
                    </IconButton>
                </div>
                <div className={classes.content}>
                    <div className={classes.wrapper}>
                        <Create className={classes.icon} color="action" />
                        <TextField
                            {...textEditorProps('title')}
                        />
                    </div>
                    <div className={classes.wrapper}>
                        <CalendarToday className={classes.icon} color="action" />
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DateTimePicker
                                label="Start Date"
                                renderInput={
                                    (props) => <TextField className={classes.picker} {...props} />
                                }
                                {...startDatePickerProps}
                            />
                            <DateTimePicker
                                label="End Date"
                                renderInput={
                                    (props) => <TextField className={classes.picker} {...props} />
                                }
                                {...endDatePickerProps}
                            />
                        </LocalizationProvider>
                    </div>
                    <div className={classes.wrapper}>
                        <LocationOn className={classes.icon} color="action" />
                        <TextField
                            {...textEditorProps('location')}
                        />
                    </div>
                    <div className={classes.wrapper}>
                        <Notes className={classes.icon} color="action" />
                        <TextField
                            {...textEditorProps('notes')}
                            multiline
                            rows="6"
                        />
                    </div>
                </div>
                <div className={classes.buttonGroup}>
                    {!isNewAppointment && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            className={classes.button}
                            onClick={() => {
                                visibleChange();
                                commitAppointment('deleted');
                            }}
                        >
                            Delete
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        color="primary"
                        className={classes.button}
                        onClick={() => {
                            visibleChange();
                            applyChanges();
                        }}
                    >
                        {isNewAppointment ? 'Create' : 'Save'}
                    </Button>
                </div>
            </StyledDiv>
        </AppointmentForm.Overlay>
    );
};

export default AppointmentFormContainerBasic;