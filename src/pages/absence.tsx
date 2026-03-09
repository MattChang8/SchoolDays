import '../components/css/workday.css';
import '../components/css/calendar.css';
import { useState } from 'react';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';


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
    const [value, setValue] = useState<Value>([null, null]);
    const [activeStartDate, setActiveStartDate] = useState<Date>(startOfCurrentMonth());


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
                                    calendarProps={{
                                        showDoubleView: false,
                                        view: "month",
                                        minDetail: "month",
                                        activeStartDate,
                                        onActiveStartDateChange: handleActiveStartDateChange
                                    }}
                                />
                                <div className='absenceSubmitRow'>
                                    <button type='button' className='absenceSubmitButton'>Submit Request</button>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}
