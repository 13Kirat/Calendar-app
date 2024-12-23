import React, { useState, useEffect } from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isLastDayOfMonth } from "date-fns";
import { Event } from "../../types/event";
import EventModal from "./EventModal";
// import { useDrag, useDrop } from "re act-dnd"; // Import react-dnd hooks

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]); // Store events
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null); // For editing an event
  const [filterKeyword, setFilterKeyword] = useState<string>(""); // Filter keyword for events

  // Load events from localStorage when the component mounts
  useEffect(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save events to localStorage whenever the events state changes
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("events", JSON.stringify(events));
    }
  }, [events]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    // If the selected date is the last day of the current month, transition to the next month
    if (isLastDayOfMonth(selectedDate!)) {
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    // If the selected date is the last day of the current month, transition to the next month
    if (isLastDayOfMonth(selectedDate!)) {
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
    }
  };

  const getCalendarDays = (): Date[] => {
    const startOfMonthDate = startOfMonth(currentMonth);
    const endOfMonthDate = endOfMonth(currentMonth);
    return eachDayOfInterval({
      start: startOfMonthDate,
      end: endOfMonthDate,
    });
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setEventToEdit(null); // Reset the event to edit when a new day is selected
    setShowModal(true); // Show the modal for adding a new event
  };

  const handleEventClick = (event: Event) => {
    setEventToEdit(event); // Set the event to edit
    setSelectedDate(event.date);
    setShowModal(true); // Show the modal for editing the event
  };

  const handleSaveEvent = (eventData: Event, id?: number) => {
    console.log(eventData, id);
    if (id) {
      // Edit event
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id ? { ...event, ...eventData } : event
        )
      );
    } else {
      // Prevent overlapping events
      const isOverlap = events.some((event) =>
        format(event.date, "yyyy-MM-dd") === format(eventData.date, "yyyy-MM-dd") &&
        event.startTime === eventData.startTime
      );

      if (isOverlap) {
        alert("An event already exists at this time. Please select a different time.");
        return;
      }

      // Add new event
      setEvents((prevEvents) => [...prevEvents, { ...eventData, id: Date.now() }]);
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterKeyword(e.target.value);
  };

  // const filteredEvents = events.filter((event) =>
  //   event.eventName.toLowerCase().includes(filterKeyword.toLowerCase()) ||
  //   event.description?.toLowerCase().includes(filterKeyword.toLowerCase())
  // );

  // Handle drag and drop logic
  // const [{ isDragging }, drag] = useDrag(() => ({
  //   type: 'EventModal',
  //   // item: {id : EventModal.id},
  //   collect: monitor => ({
  //     isDragging: !!monitor.isDragging(),
  //   }),
  // }))


  // const [{ isOver }, drop] = useDrop(() => ({
  //   accept: 'EventModal', // Accept 'EVENT' type items
  //   drop: (item: Event) => handleSaveEvent(item, item.id), // Reschedule event when dropped
  //   // canDrop: (monitor) => true, // Always allow drop
  //   collect: (monitor) => ({
  //     isOver: monitor.isOver(),
  //     // canDrop: monitor.canDrop(),
  //   }),
  // }));

  const renderCalendarGrid = () => {
    const days = getCalendarDays();
    const grid: JSX.Element[] = [];
    const startDayOfWeek = days[0].getDay(); // Get the first day of the month

    // Add empty spaces for the starting day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(<div key={`empty-${i}`} className="h-16"></div>);
    }

    // Add actual days of the month
    days.forEach((day, index) => {
      const isCurrentDay = isToday(day);
      const dayClass = isCurrentDay
        ? "bg-primary text-white"
        : "bg-white text-gray-800 hover:bg-gray-100";

      const renderEventIndicators = (day: Date) => {
        const dayEvents = events.filter(
          (event) => format(event.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
        );

        return (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            {dayEvents.length > 0 && (
              dayEvents.map((event, index) => (
                <div
                  // ref={drop}     
                  key={index}
                  className={`w-2.5 mx-0.5 mb-0.5 h-2.5 rounded-full cursor-pointer ${getCategoryColor(event.category)}`}
                  onClick={() => handleEventClick(event)} // Trigger event click for editing
                />
              ))
            )}
          </div>
        );
      };

      grid.push(
        <div
          key={index}
          // ref={drop} // Apply drop ref for handling drops
          className={`flex justify-center items-center h-16 rounded-lg shadow-md cursor-pointer transition duration-200 ease-in-out ${dayClass} relative`}
          onClick={() => handleDayClick(day)} // Handle day click to add event
        >
          {format(day, "d")}
          {renderEventIndicators(day)} {/* Add event indicators */}
        </div>
      );
    });

    return grid;
  };


  const renderEventList = () => {
    const eventsByDay: { [key: string]: Event[] } = {};

    // Group events by date
    events.forEach((event) => {
      const dateKey = format(event.date, "yyyy-MM-dd");
      if (!eventsByDay[dateKey]) {
        eventsByDay[dateKey] = [];
      }
      eventsByDay[dateKey].push(event);
    });

    // Apply filter based on the keyword
    const filteredEventsByDay = Object.entries(eventsByDay).reduce(
      (filtered, [date, dayEvents]) => {
        const matchingEvents = dayEvents.filter((event) =>
          [event.eventName, event.description, format(event.date, "yyyy-MM-dd")]
            .filter(Boolean) // Exclude null/undefined values
            .some((field) => field?.toLowerCase().includes(filterKeyword.toLocaleLowerCase()))
        );
        if (matchingEvents.length > 0) {
          filtered[date] = matchingEvents;
        }
        return filtered;
      },
      {} as { [key: string]: Event[] }
    );

    return Object.entries(filteredEventsByDay).map(([date, dayEvents]) => (
      <div key={date} className="mb-4">
        <h3 className="font-medium text-gray-800 mb-2">{format(new Date(date), "MMM dd, yyyy")}</h3>
        {dayEvents.map((event) => (
          <div
            key={event.id}
            className="p-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex justify-between items-center"
          >
            <div
              className="cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              <span className="font-medium">{event.eventName}</span>
              {event.description && <div>{event.description}</div>}
              <div>
                {event.startTime && <span>{event.startTime} to </span>}
                {event.endTime && <span>{event.endTime}</span>}
              </div>
            </div>
            <button
              onClick={() => handleDeleteEvent(event.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    ));
  };


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work':
        return 'bg-blue-300';
      case 'personal':
        return 'bg-green-300';
      case 'others':
        return 'bg-yellow-300';
      default:
        return '';
    }
  };

  const handleExportJSON = () => {
    // Filter events for the current month
    const filteredEvents = events.filter((event) => {
      const eventMonth = format(event.date, "yyyy-MM");
      const currentMonthStr = format(currentMonth, "yyyy-MM");
      return eventMonth === currentMonthStr;
    });

    // Convert to JSON
    const jsonData = JSON.stringify(filteredEvents, null, 2);

    // Create a Blob and download the JSON file
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events_${format(currentMonth, "yyyy-MM")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const handleExportCSV = () => {
    // Filter events for the current month
    const filteredEvents = events.filter((event) => {
      const eventMonth = format(event.date, "yyyy-MM");
      const currentMonthStr = format(currentMonth, "yyyy-MM");
      return eventMonth === currentMonthStr;
    });

    // Prepare CSV content
    const csvRows: string[] = [];
    const headers = ["Event Name", "Date", "Category", "Description", /*"Location"*/]; // Adjust based on your event properties
    csvRows.push(headers.join(","));

    filteredEvents.forEach((event) => {
      const row = [
        event.eventName,
        format(event.date, "yyyy-MM-dd"),
        event.category,
        event.description || "",
        event.startTime,
        event.endTime,
      ];
      csvRows.push(row.join(","));
    });

    // Create a Blob and download the CSV file
    const csvData = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(csvData);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events_${format(currentMonth, "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar with all events */}
      <div className="w-full lg:w-1/3 p-4 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-300">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">All Events</h2>
        {/* Filter input */}
        <input
          type="text"
          value={filterKeyword}
          onChange={handleFilterChange}
          placeholder="Search events..."
          className="p-2 mb-4 w-full border border-gray-300 rounded-lg"
        />
        {renderEventList()}
      </div>

      {/* Main calendar view */}
      <div className="flex-1 p-6 bg-background rounded-lg shadow-lg">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <button
            onClick={handlePreviousMonth}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors mb-4 lg:mb-0"
          >
            Previous
          </button>
          <span className="text-xl font-semibold text-gray-800 mb-4 lg:mb-0">{format(currentMonth, "MMMM yyyy")}</span>
          <button
            onClick={handleNextMonth}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Next
          </button>
        </div>

        <div className="flex flex-wrap justify-between mb-6">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mb-4 lg:mb-0"
          >
            Export to JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export to CSV
          </button>
        </div>

        {/* Weekdays Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-gray-500 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div key={index} className="font-medium">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {renderCalendarGrid()}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <EventModal
          selectedDate={selectedDate!}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEvent}
          eventToEdit={eventToEdit}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default Calendar;
