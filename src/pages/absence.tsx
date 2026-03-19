import '../components/css/workday.css';
import '../components/css/calendar.css';
import React, { useState } from 'react';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { useProfile } from '../components/profiles/profileContext.jsx';


type ValuePiece = Date | null;

type Value = [ValuePiece, ValuePiece];
type ActiveStartDateChangeArgs = {
    activeStartDate: Date | null;
    action?: string;
};

function startOfCurrentMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}


export function Absence() {
    const { activeProfile } = useProfile();
    const [value, setValue] = useState<Value>([null, null]);
    const [activeStartDate, setActiveStartDate] = useState<Date>(startOfCurrentMonth());
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitError, setSubmitError] = useState('');


    const handleRangeChange = (nextValue: Value | ValuePiece | null) => {
        if (!nextValue) {
            setValue([null, null]);
            return;
        }

        if (!Array.isArray(nextValue)) {
            setValue([nextValue, nextValue]);
            if (nextValue) {
                setActiveStartDate(new Date(nextValue.getFullYear(), nextValue.getMonth(), 1));
            }
            return;
        }

        const [nextStart, nextEnd] = nextValue;
        setValue([nextStart, nextEnd]);
        if (nextStart) {
            setActiveStartDate(new Date(nextStart.getFullYear(), nextStart.getMonth(), 1));
        }
    };


    const handleActiveStartDateChange = ({ activeStartDate: nextActiveStartDate, action }: ActiveStartDateChangeArgs) => {
        if (!nextActiveStartDate) {
            return;
        }

        if (action === 'drillUp') {
            setActiveStartDate(startOfCurrentMonth());
            return;
        }

        setActiveStartDate(nextActiveStartDate);
    };

    const storedAccrued = Number(activeProfile?.accruedTimeOff) || 0;
    const paidSickLeave = Number(activeProfile?.paidSickLeave) || 0;

    const handleSubmitRequest = () => {
        setSubmitMessage('');
        setSubmitError('');

        const [startDate, endDate] = value;
        if (!startDate || !endDate) {
            setSubmitError('Please select a start and end date for your request.');
            return;
        }

        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const dayCount = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const requestedHours = Math.max(0, dayCount) * 8;
        const availableHours = storedAccrued + paidSickLeave;

        if (requestedHours > availableHours) {
            setSubmitError('Requested time off exceeds your available balance. Please contact your manager.');
            return;
        }

        setSubmitMessage('Request submitted successfully.');
    };

    const minSelectableDate = new Date();
    minSelectableDate.setHours(0, 0, 0, 0);

    return (
        <>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
            </style>

            <div className='paddingLeft'>
                <div className='largeTitle'>
                    <p className='largeTitle'>Absence</p>
                </div>

                <div>
                    <p className='largeHeading'>Request Time Off</p>
                </div>

                <div>
                    <div className='absenceBalances'>
                        <div className='absenceBalanceCard'>
                            <span>Accrued Time Off</span>
                            <strong>{storedAccrued.toFixed(2)} hrs</strong>
                            <p>Available now</p>
                        </div>
                        <div className='absenceBalanceCard'>
                            <span>Paid Sick Leave</span>
                            <strong>{paidSickLeave.toFixed(2)} hrs</strong>
                            <p>Available now</p>
                        </div>
                    </div>
                    <div className='absenceDateInputs'>
                    </div>
                    <div className='Sample'>
                        <div className="Sample__container">
                            <main className="Sample__container__content">
                                <div className='dateLabel'>
                                    <label>
                                        Start Date &#x2800;&#x2800; End Date
                                    </label>
                                </div>
                                <DateRangePicker
                                    calendarAriaLabel="Toggle calendar"
                                    clearAriaLabel="Clear value"
                                    dayAriaLabel="Day"
                                    monthAriaLabel="Month"
                                    nativeInputAriaLabel="Date"
                                    onChange={handleRangeChange}
                                    value={value}
                                    yearAriaLabel="Year"
                                    isOpen={true}
                                    calendarIcon={null}
                                    clearIcon={null}
                                    rangeDivider="to"
                                    minDate={minSelectableDate}
                                    calendarProps={{
                                        showDoubleView: false,
                                        view: "month",
                                        minDetail: "month",
                                        activeStartDate,
                                        onActiveStartDateChange: handleActiveStartDateChange
                                    }}
                                />
                                <div className='absenceSubmitRow'>
                                    <button type='button' className='absenceSubmitButton' onClick={handleSubmitRequest}>
                                        Submit Request
                                    </button>
                                </div>
                                {submitMessage && <p className='absenceSuccess'>{submitMessage}</p>}
                                {submitError && <p className='absenceError'>{submitError}</p>}
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}
