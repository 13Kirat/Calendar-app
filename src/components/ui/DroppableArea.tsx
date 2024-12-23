import { useDrop } from 'react-dnd';

const DroppableArea = () => {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: 'ITEM',
        drop: (item) => {
            console.log('Item dropped:', item);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    return (
        <div ref={drop} style={{ backgroundColor: isOver ? 'green' : 'red' }}>
            Drop here
        </div>
    );
};

export default DroppableArea