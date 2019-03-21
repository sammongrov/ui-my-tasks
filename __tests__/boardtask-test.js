import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Actions } from 'react-native-router-flux';
import { BackHandler, View } from 'react-native';
import DbManager from '../../app/DBManager';
import BoardTask from '../BoardTask';

configure({ adapter: new Adapter() });
const card = [
  {
    _id: 'card01',
    title: 'test_01',
    boardId: 'test_board01',
    boardTitle: 'test_board01',
    members: [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }],
    listId: 'test_list01',
    description: 'test_description01',
  },
  {
    _id: 'card02',
    title: 'test_02',
    boardId: 'test_board02',
    boardTitle: 'test_board02',
    members: [{ member: 'Bob', id: 'mem2_1' }, { member: 'Nick', id: 'mem2_2' }],
    listId: 'test_list02',
    description: 'test_description02',
  },
];

jest.mock('BackHandler', () => {
  const backHandler = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  return backHandler;
});

jest.mock('react-native-router-flux', () => ({
  Actions: {
    pop: jest.fn(),
    currentScene: 'BoardTasksList',
    CardDetails: jest.fn(),
    cardId: jest.fn(),
  },
}));
jest.mock('../../app/DBManager', () => {
  const dbManager = {
    board: {
      findById: jest.fn(),
      title: 'test_boardTitle',
    },
    lists: {
      findById: jest.fn(),
    },
    _taskManager: {
      board: {
        findById: jest.fn(),
        title: '_taskManager_boardTitle',
      },
    },
    app: {
      userId: 'test_userID',
    },
    user: {
      findById: jest.fn(() => ({
        id: 123,
        name: 'test-name',
        username: 'test-username',
        avatarURL: 'https:avensome_avatar_user',
      })),
    },
    card: {
      list: [
        { name: 'card1', boardId: 'board1', listId: 'listId01' },
        { name: 'card2', boardId: 'board2', listId: 'listId02' },
        { name: 'card3', boardId: 'board3', listId: 'listId03' },
      ],
    },
  };
  return dbManager;
});
/* --- props --- */
const boardTitle = 'test-boardTitle';
const boardCards = 'test-boardCards';
const commentCount = 12;
const checklistCount = 12;

it('boardtask renders correctly', () => {
  const tree = renderer.create(<BoardTask />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('boardtask unmounts correctly', () => {
  const boardtaskTree = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  boardtaskTree.unmount();
  expect(BackHandler.removeEventListener).toHaveBeenCalled();
});
it('handleBackPress', () => {
  const rootComponent = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const instance = rootComponent.instance();
  const result = instance.handleBackPress();

  expect(result).toBe(true);
  expect(Actions.pop.mock.calls.length).toBe(1);
});

describe('fetchCardDetail method is called', () => {
  it('a current scene is "BoardTasksList"', () => {
    Actions.currentScene = 'BoardTasksList';
    const tree = renderer.create(
      <BoardTask
        cardId="7X856YIks9"
        boardTitle={boardTitle}
        boardCards={boardCards}
        commentCount={commentCount}
        checklistCount={checklistCount}
      />,
    );
    const treeInstance = tree.getInstance();
    treeInstance.fetchCardDetail('XPP89611P');
    expect(Actions.CardDetails).toBeCalled();
  });

  it('with not an object', () => {
    Actions.cardId.mockClear();
    Actions.currentScene = 'MemberInfoScene';
    const tree = renderer.create(
      <BoardTask
        cardId="7X856YIks9"
        boardTitle={boardTitle}
        boardCards={boardCards}
        commentCount={commentCount}
        checklistCount={checklistCount}
      />,
    );
    const treeInstance = tree.getInstance();
    treeInstance.fetchCardDetail('XPP89611P');
    expect(Actions.CardDetails).not.toBeCalled();
  });
});

it('Navbar onPress calls Actions.pop', () => {
  Actions.currentScene = 'BoardTasksList';
  const root = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const button = root
    .find('NavBar')
    .shallow()
    .find('TouchableOpacity');
  button.props().onPress();
  expect(Actions.pop.mock.calls.length).toBe(2);
});
it('Navbar onPress calls Actions.pop', () => {
  Actions.currentScene = 'ChatScene';
  const root = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const button = root
    .find('NavBar')
    .shallow()
    .find('TouchableOpacity');
  button.props().onPress();
  expect(Actions.pop.mock.calls.length).toBe(2);
});
it('Navbar onPress does not calls Actions.pop', () => {
  Actions.currentScene = 'BoardTasksList';
  Actions.pop.mockClear();
  const root = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const button = root
    .find('NavBar')
    .shallow()
    .find('TouchableOpacity')
    .first();
  button.props().onPress();
  expect(Actions.pop.mock.calls.length).toBe(0);
});

it('a current scene is "BoardTasksList"', () => {
  const tree = renderer.create(
    <BoardTask
      cardId="7X856YIks9"
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const treeInstance = tree.getInstance();
  treeInstance.keyExtractor('XPP89611P');
  expect(Actions.cardId).toBeCalled();
});
it('renderIcon is called with card.description, if case', () => {
  const tree = shallow(
    <BoardTask
      bardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const instance = tree.instance();
  const component = instance.renderIcon(card.description);

  expect(component).toBeTruthy();
});

it('renderIcon is called with card.description, else case', () => {
  card.description = '';
  const tree = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const instance = tree.instance();
  const component = instance.renderIcon(card.description);

  expect(component).toBeFalsy();
});

it('renderMembers, if cases', () => {
  const member = {
    id: 123,
    name: 'bob',
    avatarURL: 'https:awensome_avatar',
  };
  const tree = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const instance = tree.instance();
  instance.renderMembers(member);

  expect(DbManager.user.findById).toBeCalled();
});

it('renderMembers, first else case', () => {
  DbManager.user.findById.mockClear();
  const member = '';
  const tree = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const instance = tree.instance();
  instance.renderMembers(member);

  expect(DbManager.user.findById).not.toBeCalled();
});

it('renderMembers, second else case', () => {
  DbManager.user.findById.mockClear();
  DbManager.user.findById = jest.fn(() => '');
  const member = {
    id: 123,
    name: 'bob',
    avatarURL: 'https:awensome_avatar',
  };
  const tree = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const instance = tree.instance();
  instance.renderMembers(member);

  expect(DbManager.user.findById).toBeCalled();
  expect(instance.renderMembers(member)).toBeFalsy();
});
describe('BoardTask calls renderRowAvatar', () => {
  const rowData = {
    data: ' JDLAMS',
  };
  it('TO call renderRowAvatar  ', () => {
    const tree = shallow(<BoardTask />);
    const instance = tree.instance();
    const row = instance.renderRowAvatar(rowData);
    expect(row).toBeNull();
  });
});
it('To call renderListAvatar', () => {
  const tree = shallow(<BoardTask />);
  const instance = tree.instance();
  const data = [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }];
  const mem = JSON.stringify(data);
  const avatarlist = instance.renderListAvatar(mem);
  const lv = avatarlist.find('ListView');
  expect(lv).toBeTruthy();
});

it('renderBoards, Application = false', () => {
  _.groupBy = jest.fn(() => ({ title01: 'title01', title02: 'title02' }));

  const tree = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const boardID = 'test_boardId01';
  const dataSource = [
    {
      _id: 'card1',
      title: 'test_1',
      boardId: 'test_board1',
      boardTitle: 'test_boardTitle1',
      members: [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }],
      listId: 'test_list1',
      description: 'test_description01',
    },
    {
      _id: 'cardId02',
      title: 'test_2',
      boardId: 'test_board2',
      boardTitle: 'test_boardTitl02',
      members: [{ member: 'Bob', id: 'mem2_1' }, { member: 'Nick', id: 'mem2_2' }],
      listId: 'test_list2',
      description: 'test_description02',
    },
  ];
  tree.setState({ boardID, dataSource });
  tree.update();
  const instance = tree.instance();
  const node = shallow(<View>{instance.renderBoards()}</View>);

  const TO = node.find('TouchableOpacity').first();
  TO.props().onLongPress();
  expect(tree.state().cardCardId).toBe('');
});

it('renderCards, TO onPress, onLongPress is called, if case', () => {
  const tree = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const instance = tree.instance();
  instance.renderListAvatar = jest.fn();
  instance.fetchCardDetail = jest.fn();
  const node = shallow(instance.renderCards({ item: card[0] }));
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();
  TO.props().onLongPress();

  expect(instance.fetchCardDetail).toBeCalled();
  expect(tree.state().commentCount).toBe('');
  expect(tree.state().checklistCount).toBe('test_listId01');
});
it('renderCards, TO onPress, onLongPress is called, else case', () => {
  card[0].members = '';

  const tree = shallow(
    <BoardTask
      boardTitle={boardTitle}
      boardCards={boardCards}
      commentCount={commentCount}
      checklistCount={checklistCount}
    />,
  );
  const instance = tree.instance();
  instance.renderListAvatar = jest.fn();
  instance.fetchCardDetail = jest.fn();
  const node = shallow(instance.renderCards({ item: card[0] }));
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();
  TO.props().onLongPress();

  expect(instance.fetchCardDetail).not.toBeCalled();
});
it('onValueChange of a slider', () => {
  const tree = shallow(<BoardTask />);
  const instance = tree.instance();
  instance.fetchCardDetail = jest.fn();
  const deleteButton = tree.find('TouchableOpacity').last();
  deleteButton.props().onPress();
  expect(instance.fetchCardDetail).toBeCalled();
});
