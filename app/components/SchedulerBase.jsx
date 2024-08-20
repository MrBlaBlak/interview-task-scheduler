'use client'
import React, {useEffect, useState} from 'react';
import Paper from '@mui/material/Paper';
import {
    AllDayPanel,
    AppointmentForm,
    Appointments,
    AppointmentTooltip,
    DayView,
    DragDropProvider,
    EditRecurrenceMenu,
    MonthView,
    Scheduler,
    Toolbar,
    ViewSwitcher,
    WeekView
} from '@devexpress/dx-react-scheduler-material-ui';
import {EditingState, ViewState} from '@devexpress/dx-react-scheduler';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import {styled} from '@mui/material/styles';
import AppointmentFormContainerBasic from './AppointmentFormContainerBasic';
import TextField from "@mui/material/TextField";
import MenuItem from '@mui/material/MenuItem';
import {collection, getDocs, addDoc, updateDoc, deleteDoc, doc} from "firebase/firestore"
import {db} from "../firebase-config";


const PREFIX = 'Demo';
const classes = {
    addButton: `${PREFIX}-addButton`,
    container: `${PREFIX}-container`,
    text: `${PREFIX}-text`,
};
const StyledDiv = styled('div')(({ theme }) => ({
    [`&.${classes.container}`]: {
        display: 'flex',
        marginBottom: theme.spacing(2),
        justifyContent: 'flex-end',
    },
    [`& .${classes.text}`]: {
        ...theme.typography.h6,
        marginRight: theme.spacing(2),
    },
}));
const StyledFab = styled(Fab)(({theme}) => ({
    [`&.${classes.addButton}`]: {
        position: 'absolute',
        bottom: theme.spacing(3),
        right: theme.spacing(4),
    },
}));
const allDayLocalizationMessages = {
    'pl-PL': {
        allDay: 'Cały dzień',
    },
    'en-US': {
        allDay: 'All Day',
    },
};
const getAllDayMessages = locale => allDayLocalizationMessages[locale];
const LocaleSwitcher = (
    ({onLocaleChange, currentLocale}) => (
        <StyledDiv className={classes.container}>
            <div className={classes.text}>
                Locale:
            </div>
            <TextField
                select
                variant="standard"
                value={currentLocale}
                onChange={onLocaleChange}
            >
                <MenuItem value="pl-PL">Polski (Poland)</MenuItem>
                <MenuItem value="en-US">English (United States)</MenuItem>
            </TextField>
        </StyledDiv>
    )
);
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const SchedulerBase = () => {
    const [data, setData] = useState([]);
    const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [editingFormVisible, setEditingFormVisible] = useState(false);
    const [deletedAppointmentId, setDeletedAppointmentId] = useState(null);
    const [editingAppointment, setEditingAppointment] = useState(undefined);
    const [previousAppointment, setPreviousAppointment] = useState(undefined);
    const [addedAppointment, setAddedAppointment] = useState({});
    const [startDayHour, setStartDayHour] = useState(9);
    const [endDayHour, setEndDayHour] = useState(19);
    const [isNewAppointment, setIsNewAppointment] = useState(false);
    const [locale, setLocale] = useState("pl-PL")

    const appointmentsCollectionRef = collection(db, "appointments")
    useEffect(()=>{
        const getAppointments = async () => {
            const appointments = await getDocs(appointmentsCollectionRef);
            const formattedAppointments = appointments.docs.map((doc) => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    startDate: formatDateTime(data.startDate.toDate()),
                    endDate: formatDateTime(data.endDate.toDate())
                };
            });
            setData(formattedAppointments)
        }
        getAppointments()

    },[])
    const changeLocale = (e) => {
        setLocale(e.target.value);
    }
    const toggleEditingFormVisibility = () => {
        setEditingFormVisible(!editingFormVisible);
    };

    const toggleConfirmationVisible = () => {
        setConfirmationVisible(!confirmationVisible);
    };

    const commitChanges = async ({added, changed, deleted}) => {
        let updatedData = data;
        if (added) {
            const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
            updatedData = [...data, { id: startingAddedId, ...added }];
            await addDoc(appointmentsCollectionRef, {...added})
        }
        if (changed) {
            updatedData = updatedData.map(appointment => {
                if (changed[appointment.id]) {
                    const appointmentDocRef = doc(appointmentsCollectionRef, appointment.id.toString());
                    updateDoc(appointmentDocRef, changed[appointment.id]);
                    return {...appointment, ...changed[appointment.id]};
                }
                return appointment;
            });

        }
        if (deleted !== undefined) {
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

    const commitDeletedAppointment = async () => {
        let updatedData = data;
        updatedData = updatedData.filter(appointment => appointment.id !== deletedAppointmentId);
        const appointmentDocRef = doc(appointmentsCollectionRef, deletedAppointmentId.toString());
        await deleteDoc(appointmentDocRef);
        setData(updatedData);
        setDeletedAppointmentId(null);
        toggleConfirmationVisible();

    };

    return (
        <div >
            <LocaleSwitcher
                currentLocale={locale}
                onLocaleChange={changeLocale}
            />
            <Paper>
                <Scheduler data={data} height={660} locale={locale}>
                    <ViewState currentDate={currentDate}/>
                    <EditingState
                        onCommitChanges={commitChanges}
                        onEditingAppointmentChange={onEditingAppointmentChange}
                        onAddedAppointmentChange={onAddedAppointmentChange}
                    />
                    <DayView startDayHour={startDayHour} endDayHour={endDayHour}/>
                    <WeekView startDayHour={startDayHour} endDayHour={endDayHour}/>
                    <MonthView />
                    <AllDayPanel
                        messages={getAllDayMessages(locale)}
                    />
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
                        <Button onClick={() => commitDeletedAppointment()} color="secondary" variant="outlined">
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
        </div>
    );
};

export default SchedulerBase;