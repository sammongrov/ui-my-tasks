import React from 'react';
import { View, TouchableOpacity, FlatList, ScrollView, Modal, Alert, ListView } from 'react-native';
// import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Actions } from 'react-native-router-flux';
import DbManager from '../../app/DBManager';
import _ from 'lodash';

import MyTasks from '../MyTasks';

configure({ adapter: new Adapter() });

jest.mock('react-native-router-flux', () => ({
  Actions: {
    currentScene: 'MyTasksList',
    CardDetails: jest.fn(),
    BoardTasksList: jest.fn(),
  },
}));

jest.mock('Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('lodash', () => {
  const lodash = {
    groupBy: jest.fn(),
    sortBy: jest.fn(),
    filter: jest.fn(),
  };
  return lodash;
});

jest.mock('../../app/DBManager', () => {
  const dbManager = {
    board: {
      fetchUserTasks: jest.fn(),
      findById: jest.fn(),
      title: 'test_boardTitle',
    },
    lists: {
      findById: jest.fn(),
    },
    app: {
      userId: 'app_test_userID_01',
    },
    user: {
      findById: jest.fn(() => ({
        id: 123,
        name: 'test-name',
        username: 'test-username',
        avatarURL: 'https:avensome_avatar_user',
      })),
      id: 123,
      name: 'test-name',
      username: 'test-username',
    },
    card: {
      addCardListener: jest.fn(),
      removeCardListener: jest.fn(),
      list: [
        { name: 'cadrd01', boardId: 'boardId01', listId: 'listId01' },
        { name: 'cadrd02', boardId: 'boardId02', listId: 'listId02' },
        { name: 'cadrd03', boardId: 'boardId03', listId: 'listId03' },
      ],
    },
  };
  return dbManager;
});

const card = [
  {
    _id: 'cardId01',
    title: 'test_title01',
    boardId: 'test_boardId01',
    boardTitle: 'test_boardTitle01',
    members: [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }],
    listId: 'test_listId01',
    description: 'test_description01',
    listTitle: 'test_listTitle01',
  },
  {
    _id: 'cardId02',
    title: 'test_title02',
    boardId: 'test_boardId02',
    boardTitle: 'test_boardTitle02',
    members: [{ member: 'Bob', id: 'mem2_1' }, { member: 'Nick', id: 'mem2_2' }],
    listId: 'test_listId02',
    description: 'test_description02',
    listTitle: 'test_listTitle02',
  },
];

beforeEach(() => {
  jest.resetModules();
});

/* --- UT --- */
it('MyTask, render', () => {
  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  instance.renderMain = jest.fn();
  instance.renderFilterByList = jest.fn();
  instance.fetchUserTasks = jest.fn();
  // console.log(tree.debug());
  const navbar = tree.find({ titleText: 'My Tasks' }).first();

  expect(navbar).toBeTruthy();
});

/* ----- renderMain, line_438 ----- */
it('MyTask, renderMain, if case, filter=false', () => {
  const tree = shallow(<MyTasks />);
  const dataSource = [
    { userId: 'app_test_userID_01' },
    { userId: 'app_test_userID_02' },
    { userId: 'app_test_userID_03' },
  ];
  const boardsOfCards = [{ cardName: 'card_01' }, { cardName: 'card_02' }, { cardName: 'card_03' }];
  tree.setState({ dataSource, boardsOfCards, filter: false });
  tree.update();

  const instance = tree.instance();
  instance.renderBoards = jest.fn();
  instance.renderMain();

  expect(instance.renderBoards).toBeCalled();
});

it('MyTask, renderMain, if case, filter=true', () => {
  const tree = shallow(<MyTasks />);
  const dataSource = [
    { userId: 'app_test_userID_01' },
    { userId: 'app_test_userID_02' },
    { userId: 'app_test_userID_03' },
  ];
  const boardsOfCards = [{ cardName: 'card_01' }, { cardName: 'card_02' }, { cardName: 'card_03' }];
  tree.setState({ dataSource, boardsOfCards, filter: true });
  tree.update();

  const instance = tree.instance();
  instance.renderFilterList = jest.fn();
  instance.renderMain();

  expect(instance.renderFilterList).toBeCalled();
});

/* ----- renderFilterList, line_458 ----- */
it('renderFilterList, if case', () => {
  const tree = shallow(<MyTasks />);
  const boardsOfCards = [{ cardName: 'card_01' }, { cardName: 'card_02' }, { cardName: 'card_03' }];
  const listWithFilter = [
    {
      _id: 'cardId01',
      title: 'test_title01',
      boardId: 'test_boardId01',
      boardTitle: 'test_boardTitle01',
      members: [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }],
      listId: 'test_listId01',
      description: 'test_description01',
    },
  ];
  tree.setState({ boardsOfCards, listWithFilter });
  tree.update();
  const instance = tree.instance();
  instance.renderFilterList();

  expect(instance.renderFilterList).toBeTruthy();
});

it('renderFilterList, else case', () => {
  const tree = shallow(<MyTasks />);
  const boardsOfCards = [];
  const listWithFilter = [
    {
      _id: 'cardId01',
      title: 'test_title01',
      boardId: 'test_boardId01',
      boardTitle: 'test_boardTitle01',
      members: [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }],
      listId: 'test_listId01',
      description: 'test_description01',
    },
  ];
  tree.setState({ boardsOfCards, listWithFilter });
  tree.update();
  const instance = tree.instance();
  instance.renderFilterList();

  expect(tree.state().boardsOfCards.length).toBe(0);
});

/* ----- renderBoards, line_382 ----- */
it('renderBoards, first if case, TO1 onPress, if case', () => {
  Actions.currentScene = 'MyTasksList';
  Actions.BoardTasksList.mockClear();

  const tree = shallow(<MyTasks />);
  const boardsOfCards = [
    { cardName: 'card_01', _id: 'card_01_ID', title: 'card_01_title' },
    { cardName: 'card_02', _id: 'card_02_ID', title: 'card_02_title' },
    { cardName: 'card_03', _id: 'card_03_ID', title: 'card_03_title' },
  ];
  const dataSource = [
    { userId: 'app_test_userID_01', boardId: 'boardId_01' },
    { userId: 'app_test_userID_02', boardId: 'card_02_ID' },
    { userId: 'app_test_userID_03', boardId: 'boardId_03' },
  ];
  tree.setState({ boardsOfCards, dataSource, commentCount: null, checklistCount: null });
  tree.update();
  const instance = tree.instance();
  const node = shallow(<View>{instance.renderBoards()}</View>);
  // console.log(node.debug());
  const TO1 = node.find('TouchableOpacity').first();
  TO1.props().onPress();

  expect(Actions.BoardTasksList).toBeCalled();
});

it('renderBoards, first if case, TO1 onPress, else case', () => {
  Actions.currentScene = '';
  Actions.BoardTasksList.mockClear();

  const tree = shallow(<MyTasks />);
  const boardsOfCards = [
    { cardName: 'card_01', _id: 'card_01_ID', title: 'card_01_title' },
    { cardName: 'card_02', _id: 'card_02_ID', title: 'card_02_title' },
    { cardName: 'card_03', _id: 'card_03_ID', title: 'card_03_title' },
  ];
  const dataSource = [
    { userId: 'app_test_userID_01', boardId: 'boardId_01' },
    { userId: 'app_test_userID_02', boardId: 'card_02_ID' },
    { userId: 'app_test_userID_03', boardId: 'boardId_03' },
  ];
  tree.setState({ boardsOfCards, dataSource, commentCount: null, checklistCount: null });
  tree.update();
  const instance = tree.instance();
  const node = shallow(<View>{instance.renderBoards()}</View>);
  // console.log(node.debug());
  const TO1 = node.find('TouchableOpacity').first();
  TO1.props().onPress();

  expect(Actions.BoardTasksList).not.toBeCalled();
});

it('renderBoards, first else case', () => {
  const tree = shallow(<MyTasks />);
  const boardsOfCards = [];
  const dataSource = [
    { userId: 'app_test_userID_01', boardId: 'boardId_01' },
    { userId: 'app_test_userID_02', boardId: 'card_02_ID' },
    { userId: 'app_test_userID_03', boardId: 'boardId_03' },
  ];
  tree.setState({ boardsOfCards, dataSource, commentCount: null, checklistCount: null });
  tree.update();
  const instance = tree.instance();
  const node = shallow(<View>{instance.renderBoards()}</View>);
  // console.log(node.debug());

  expect(tree.state().boardsOfCards.length).toBe(0);
});

/* ----- renderCards, line_269 ----- */
it('renderCards, TO onPres is called, commentCount=5', () => {
  const tree = shallow(<MyTasks />);
  tree.setState({ commentCount: 5, checklistCount: null });
  tree.update();

  const instance = tree.instance();
  instance.fetchCardDetail = jest.fn();
  instance.renderIcon = jest.fn();
  const node = shallow(<View> {instance.renderCards({ item: card[0] })}</View>);
  // console.log(node.debug());
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();
  const icon = node.find({ name: 'comment-text-outline' }).first();

  expect(instance.fetchCardDetail).toBeCalled();
  expect(icon).toBeTruthy();
  expect(instance.renderIcon).toBeCalledWith('test_description01');
});

it('renderCards, commentCount=false, checklistCount=7', () => {
  const tree = shallow(<MyTasks />);
  tree.setState({ commentCount: null, checklistCount: 7 });
  tree.update();
  const instance = tree.instance();
  instance.renderIcon = jest.fn();
  const node = shallow(<View>{instance.renderCards({ item: card[0] })}</View>);
  // console.log(node.debug());
  const icon = node.find({ name: 'checkbox-marked-outline' }).first();
  const view = node.find({ style: { borderColor: '#D9E9FF' } }).first();

  expect(icon).toBeTruthy();
  expect(instance.renderIcon).toBeCalledWith('test_description01');
  expect(view).toBeTruthy();
});

it('renderCards, commentCount=false, checklistCount=false, description=true', () => {
  const tree = shallow(<MyTasks />);
  tree.setState({ commentCount: null, checklistCount: null });
  tree.update();
  const instance = tree.instance();
  instance.renderIcon = jest.fn();
  const node = shallow(<View>{instance.renderCards({ item: card[0] })}</View>);
  // console.log(node.debug());
  const view = node.find({ style: { borderColor: '#D9E9FF' } }).first();

  expect(instance.renderIcon).toBeCalledWith('test_description01');
  expect(view).toBeTruthy();
});

it('renderCards, commentCount=false, checklistCount=false, description=false', () => {
  card[0].description = '';

  const tree = shallow(<MyTasks />);
  tree.setState({ commentCount: null, checklistCount: null });
  tree.update();
  const instance = tree.instance();
  instance.renderIcon = jest.fn();
  const node = shallow(<View>{instance.renderCards({ item: card[0] })}</View>);
  // console.log(node.debug());
  const view = node.find({ style: { borderColor: '#D9E9FF' } }).first();

  expect(instance.renderIcon).toBeCalledWith('');
  expect(view).toBeTruthy();
});

it('renderCards, commentCount=false, checklistCount=false, description=false, listTitle=false', () => {
  card[0].description = '';
  card[0].listTitle = '';

  const tree = shallow(<MyTasks />);
  tree.setState({ commentCount: null, checklistCount: null });
  tree.update();
  const instance = tree.instance();
  instance.renderIcon = jest.fn();
  const node = shallow(<View>{instance.renderCards({ item: card[0] })}</View>);
  // console.log(node.debug());
  const view = node.find({ style: { borderColor: '#D9E9FF' } }).first();

  expect(instance.renderIcon).toBeCalledWith('');
});

/* ----- renderListAvatar, line_249 ----- */
it('renderListAvatar, if case', () => {
  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  const data = [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }];
  const mem = JSON.stringify(data);
  const node = shallow(instance.renderListAvatar(mem));
  // console.log(node);
  const listview = node.find('ListView');

  expect(listview).toBeTruthy();
});

it('renderListAvatar, else case', () => {
  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  const data = [];
  const mem = JSON.stringify(data);
  const node = instance.renderListAvatar(mem);
  console.log(node);

  expect(instance.renderListAvatar).toHaveLength(1);
});

/* ----- renderRowAvatar, line_244 ----- */
it('renderRowAvatar', () => {
  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  const rowData = 'rowData_test';
  instance.renderMembers = jest.fn();
  instance.renderRowAvatar(rowData);

  expect(instance.renderMembers).toBeCalledWith('rowData_test');
});

/* ----- renderMembers, line_230 ----- */
it('renderMembers, if cases', () => {
  DbManager.user.findById.mockClear();
  const member = {
    id: 123,
    name: 'bob',
    avatarURL: 'https:awensome_avatar',
  };

  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  instance.renderMembers(member);

  expect(DbManager.user.findById).toBeCalled();
});

it('renderMembers, first else case', () => {
  DbManager.user.findById.mockClear();
  const member = '';

  const tree = shallow(<MyTasks />);
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
  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  instance.renderMembers(member);

  expect(DbManager.user.findById).toBeCalled();
  expect(instance.renderMembers(member)).toBeFalsy();
});

/* ----- renderFilterByList, line_124 ----- */
it('renderFilterByList, onRequestClose is called', () => {
  Alert.alert.mockClear();
  jest.mock('Alert', () => ({
    alert: jest.fn(),
  }));

  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  const node = shallow(instance.renderFilterByList());
  // console.log(mod.debug());
  const modal = node.find('Modal').first();
  modal.props().onRequestClose();

  expect(Alert.alert).toBeCalledWith('Modal has been closed.');
});

it('renderFilterByList, FlatList, TO onPress', () => {
  const tree = shallow(<MyTasks />);
  const categoryList = [
    { key: 1, _id: 'listItem01', item: 'item1', index: 'index1' },
    { key: 2, _id: 'listItem02', item: 'item2', index: 'index2' },
  ];
  tree.setState({ categoryList, filter: false });
  tree.update();
  const instance = tree.instance();
  instance.filteredList = jest.fn();
  instance.setModalVisible = jest.fn();
  const node = shallow(instance.renderFilterByList());
  const flatList = node.find('FlatList').first();
  // console.log(node.debug());
  const keyResult = flatList.props().keyExtractor(categoryList[0]);

  expect(keyResult).toMatch(categoryList[0].toString());

  // ----- renderItem
  const TO = shallow(<View>{flatList.props().renderItem(categoryList[0])}</View>).find(
    'TouchableOpacity',
  );
  TO.props().onPress();

  expect(instance.filteredList).toBeCalledWith('item1');
  expect(instance.setModalVisible).toBeCalled();
  expect(tree.state().filter).toBe(true);
});

it('renderFilterByList, FlatList, TO onPress, Text color = true', () => {
  const tree = shallow(<MyTasks />);
  const categoryList = [
    { key: 1, _id: 'listItem01', item: 'item1', index: 'index1' },
    { key: 2, _id: 'listItem02', item: 'item2', index: 'index2' },
  ];
  tree.setState({ categoryList, filter: false, selectedListName: 'item1' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderFilterByList());
  const flatList = node.find('FlatList').first();
  // console.log(node.debug());

  // renderItem
  const TO = shallow(<View>{flatList.props().renderItem(categoryList[0])}</View>).find(
    'TouchableOpacity',
  );
  TO.props().onPress();

  expect(tree.state().filter).toBe(true);
});

it('renderFilterByList TO(Close btn) is called', () => {
  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  instance.setModalVisible = jest.fn();
  instance.renderFilterByList();
  // console.log(tree.debug());
  const TO = tree.find('TouchableOpacity').first();
  TO.props().onPress();

  expect(instance.setModalVisible).toBeCalled();
});

/* ----- renderIcon, line_114 ---- */
it('renderIcon is called with card.description, if case', () => {
  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  const component = instance.renderIcon(card.description);

  expect(component).toBeTruthy();
});

it('renderIcon is called with card.description, else case', () => {
  card.description = '';
  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  const component = instance.renderIcon(card.description);

  expect(component).toBeFalsy();
});

/* ----- keyExtractor, line_103 ----- */
it('keyExtractor', () => {
  const tree = shallow(<MyTasks />);
  const instance = tree.instance();

  expect(instance.keyExtractor(card[0])).toEqual('cardId01');
});

/* ----- fetchCardDetail, line_93 ----- */
it('fetchCardDetail is called, if case', () => {
  Actions.currentScene = 'MyTasksList';
  Actions.CardDetails.mockClear();

  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  instance.fetchCardDetail(card[0]);

  expect(Actions.CardDetails).toBeCalled();
});

it('fetchCardDetail is called, else case', () => {
  Actions.currentScene = '';
  Actions.CardDetails.mockClear();

  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  instance.fetchCardDetail(card[0]);

  expect(Actions.CardDetails).not.toBeCalled();
});

/* ----- fetchUserTasks, line_87 ----- */
it('fetchUserTasks, if case', () => {
  DbManager.board.fetchUserTasks.mockClear();

  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  instance.fetchUserTasks();

  expect(DbManager.board.fetchUserTasks).toBeCalled();
});

it('fetchUserTasks, else case', () => {
  DbManager.board.fetchUserTasks.mockClear();
  DbManager.app.userId = '';

  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  instance.fetchUserTasks();

  expect(DbManager.board.fetchUserTasks).not.toBeCalled();
});

/* ----- updateBoardList, line_51 ----- */
it('updateBoardList, else case', () => {
  DbManager.card.list = [
    { name: 'cadrd01', boardId: 'boardId01', listId: 'listId01' },
    { name: 'cadrd02', boardId: 'boardId02', listId: 'listId02' },
    { name: 'cadrd03', boardId: 'boardId03', listId: 'listId03' },
  ];
  DbManager.board.findById.mockClear();
  DbManager.board.findById = jest.fn(() => 'boardTITLE');
  DbManager.lists.findById.mockClear();
  DbManager.lists.findById = jest.fn(() => 'listsTITLE');
  _.groupBy = jest.fn(() => ({ title01: 'title01', title02: 'title02' }));

  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  instance.updateBoardList();

  expect(DbManager.board.findById).toBeCalledTimes(6);
  expect(DbManager.lists.findById).toBeCalledTimes(6);
});

it('updateBoardList, first if case', () => {
  DbManager.board.findById.mockClear();
  DbManager.board.findById = jest.fn(() => 'boardTITLE');
  DbManager.lists.findById.mockClear();
  DbManager.lists.findById = jest.fn(() => 'listsTITLE');

  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  instance._isMounted = false;
  instance.updateBoardList();

  expect(DbManager.board.findById).not.toBeCalled();
  expect(DbManager.lists.findById).not.toBeCalled();
});

/* ----- setModalVisible, line_47 ----- */
it('setModalVisible is called', () => {
  const tree = shallow(<MyTasks />);
  tree.setState({ modalVisible: false });
  tree.update();
  expect(tree.state().modalVisible).toBe(false);

  const instance = tree.instance();
  instance.setModalVisible(true);

  expect(tree.state().modalVisible).toBe(true);
});

/* ----- componentWillUnmount, line_42 ----- */
it('groupTask componentWillUnmount', () => {
  DbManager.card.removeCardListener.mockClear();

  const tree = shallow(<MyTasks />);
  const instance = tree.instance();
  tree.unmount();

  expect(instance._isMounted).toBe(false);
  expect(DbManager.card.removeCardListener).toBeCalled();
});
