import { useDesignStore } from '@/stores/designStore';
import { Item, Menu, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

const MENU_ID = 'element-context-menu';

interface ContextMenuProps {
  id: string;
  type: 'wall' | 'door' | 'window' | 'stair';
}

export function ElementContextMenu() {
  const { removeWall, removeDoor, removeWindow, removeStair } = useDesignStore();

  const handleItemClick = ({ id, props }: any) => {
    if (!props) return;

    switch (id) {
      case 'delete':
        switch (props.type) {
          case 'wall':
            removeWall(props.id);
            break;
          case 'door':
            removeDoor(props.id);
            break;
          case 'window':
            removeWindow(props.id);
            break;
          case 'stair':
            removeStair(props.id);
            break;
        }
        break;
      // Add other cases for duplicate, properties, etc.
    }
  };

  return (
    <Menu id={MENU_ID} onClick={handleItemClick}>
      <Item id="properties">Edit Properties</Item>
      <Item id="duplicate">Duplicate</Item>
      <Item id="delete">Delete</Item>
    </Menu>
  );
}

export function useElementContextMenu() {
  return useContextMenu<ContextMenuProps>({ id: MENU_ID });
}
