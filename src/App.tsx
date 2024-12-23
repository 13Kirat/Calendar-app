import Calendar from "./components/ui/calendar";
import "./index.css";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import { DragDropContext } from 'react-beautiful-dnd';

function App() {
  return (
    <div className="App">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Dynamic Event Calendar</h1>
      <DndProvider backend={HTML5Backend}>
        <Calendar />
      </DndProvider>
    </div>
  );
}

export default App;
