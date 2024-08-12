import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import {
    Scheduler,
    WeekView,
    MonthView,
    Appointments,
    Toolbar,
    ViewSwitcher,
    AppointmentTooltip,
    AppointmentForm,
    DragDropProvider,
    EditRecurrenceMenu,
    AllDayPanel,
    DayView
} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { appointments } from '../demo-data/appointments';
import AppointmentFormContainerBasic from './AppointmentFormContainerBasic';

const PREFIX = 'Demo';
const classes = {
    addButton: `${PREFIX}-addButton`,
};

const StyledFab = styled(Fab)(({ theme }) => ({
    [`&.${classes.addButton}`]: {
        position: 'absolute',
        bottom: theme.spacing(3),
        right: theme.spacing(4),
    },
}));

const SchedulerTest = () => {
    const [data, setData] = useState([]);
    const [currentDate, setCurrentDate] = useState('2018-11-01');
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [editingFormVisible, setEditingFormVisible] = useState(false);
    const [deletedAppointmentId, setDeletedAppointmentId] = useState(null);
    const [editingAppointment, setEditingAppointment] = useState(undefined);
    const [previousAppointment, setPreviousAppointment] = useState(undefined);
    const [addedAppointment, setAddedAppointment] = useState({});
    const [startDayHour, setStartDayHour] = useState(9);
    const [endDayHour, setEndDayHour] = useState(19);
    const [isNewAppointment, setIsNewAppointment] = useState(false);

    const toggleEditingFormVisibility = () => {
        setEditingFormVisible(!editingFormVisible);
    };

    const toggleConfirmationVisible = () => {
        setConfirmationVisible(!confirmationVisible);
    };

    const commitChanges = ({ added, changed, deleted }) => {
        let updatedData = data;
        if (added) {
            console.log(added + " added")
            const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
            updatedData = [...data, { id: startingAddedId, ...added }];
        }
        if (changed) {
            console.log(changed + " changed")
            updatedData = updatedData.map(appointment => (
                changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment));
        }
        if (deleted !== undefined) {
            console.log(deleted + " deleted")
            updatedData = updatedData.filter(appointment => appointment.id !== deleted);
            setDeletedAppointmentId(deleted);
            toggleConfirmationVisible();
        }
        setData(updatedData);
        setAddedAppointment({});
    };

    const onEditingAppointmentChange = (appointment) => {
        setEditingAppointment(appointment);
    };

    const onAddedAppointmentChange = (appointment) => {
        setAddedAppointment(appointment);
        if (editingAppointment !== undefined) {
            setPreviousAppointment(editingAppointment);
        }
        setEditingAppointment(undefined);
        setIsNewAppointment(true);
    };

    useEffect(() => {
        if (deletedAppointmentId !== null) {
            commitChanges({ deleted: deletedAppointmentId });
        }
    }, [deletedAppointmentId]);

    return (
        <Paper>
            <Scheduler data={data} height={660}>
                <ViewState currentDate={currentDate} />
                <EditingState
                    onCommitChanges={commitChanges}
                    onEditingAppointmentChange={onEditingAppointmentChange}
                    onAddedAppointmentChange={onAddedAppointmentChange}
                />
                <DayView startDayHour={startDayHour} endDayHour={endDayHour} />
                <WeekView startDayHour={startDayHour} endDayHour={endDayHour} />
                <MonthView />
                <AllDayPanel />
                <EditRecurrenceMenu />
                <Appointments />
                <AppointmentTooltip showOpenButton showCloseButton showDeleteButton />
                <Toolbar />
                <ViewSwitcher />
                <AppointmentForm
                    overlayComponent={(props) => (
                        <AppointmentFormContainerBasic
                            {...props}
                            visible={editingFormVisible}
                            appointmentData={editingAppointment || addedAppointment}
                            commitChanges={commitChanges}
                            visibleChange={toggleEditingFormVisibility}
                            cancelAppointment={() => {
                                if (isNewAppointment) {
                                    setEditingAppointment(previousAppointment);
                                    setIsNewAppointment(false);
                                }
                            }}
                        />
                    )}
                    visible={editingFormVisible}
                    onVisibilityChange={toggleEditingFormVisibility}
                />
                <DragDropProvider />
            </Scheduler>

            <Dialog open={confirmationVisible} onClose={toggleConfirmationVisible}>
                <DialogTitle>Delete Appointment</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this appointment?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={toggleConfirmationVisible} color="primary" variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={() => setDeletedAppointmentId(deletedAppointmentId)} color="secondary" variant="outlined">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <StyledFab
                color="secondary"
                className={classes.addButton}
                onClick={() => {
                    setEditingFormVisible(true);
                    onEditingAppointmentChange(undefined);
                    onAddedAppointmentChange({
                        startDate: new Date(currentDate).setHours(startDayHour),
                        endDate: new Date(currentDate).setHours(startDayHour + 1),
                    });
                }}
            >
                <AddIcon />
            </StyledFab>
        </Paper>
    );
};

export default SchedulerTest;