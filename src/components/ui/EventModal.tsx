import React, { useState, useEffect } from "react";
import { Event } from "../../types/event";

interface EventModalProps {
  selectedDate: Date;
  onClose: () => void;
  onSave: (eventData: Event, eventId?: number) => void;
  eventToEdit?: Event | null;
  onDelete: (eventId: number) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  selectedDate,
  onClose,
  onSave,
  eventToEdit,
  onDelete,
}) => {
  const [eventName, setEventName] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<'work' | 'personal' | 'others'>('work'); // Default category

  // Pre-fill the form if editing an event
  useEffect(() => {
    if (eventToEdit && !Array.isArray(eventToEdit)) {
      setEventName(eventToEdit.eventName);
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
      setDescription(eventToEdit.description || "");
      setCategory(eventToEdit.category); // Set the category when editing
    }
  }, [eventToEdit]);

  const handleSave = () => {
    if (eventName && startTime && endTime) {
      const eventData: Event = {
        eventName,
        startTime,
        endTime,
        description,
        category,
        date: selectedDate,
        id: eventToEdit ? eventToEdit.id : Date.now(), // Use existing id or generate a new one
      };
      onSave(eventData, eventToEdit?.id); // Pass id for editing
      onClose();
    }
  };

  const handleDelete = () => {
    if (eventToEdit && !Array.isArray(eventToEdit)) {
      onDelete(eventToEdit.id); // Call onDelete for event deletion
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">
          {Array.isArray(eventToEdit) ? "Events on this day" : eventToEdit ? "Edit Event" : "Add Event"}
        </h2>

        {Array.isArray(eventToEdit) ? (
          <div className="mb-4">
            {eventToEdit.map((event) => (
              <div key={event.id} className="border-b pb-2 mb-2">
                <h3 className="font-semibold">{event.eventName}</h3>
                <p>{format(event.date, "hh:mm a")} - {event.endTime}</p>
                <p>{event.description}</p>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => onSave(event)} // Edit event
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(event.id)} // Delete event
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Edit or create event form */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Event Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Event Description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'work' | 'personal' | 'others')}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600"
              >
                {eventToEdit ? "Update Event" : "Save Event"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;
