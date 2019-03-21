/* ---- all imports ---- */

import React from 'react';

import {
  View,
  // TouchableOpacity,
  // FlatList,
  // ScrollView,
  // Modal,
  Alert,
  // ListView,
  BackHandler,
} from 'react-native';

// import { styles } from 'react-native-theme';
// import { iOSColors } from 'react-native-typography';
import { Actions } from 'react-native-router-flux';
// import {
//   NavBar,
//   Text,
//   Screen,
//   Icon,
//   Avatar,
//   TextInput,
//   AntDesignIcon,
//   EvilIcon,
//   FontAwesomeIcon,
// } from '@ui/components';
// import { Colors } from '@ui/theme_default';

import _ from 'lodash';

import { shallow, configure } from 'enzyme';
import renderer from 'react-test-renderer';
import Adapter from 'enzyme-adapter-react-16';
import Application from '../../constants/config';
import DbManager from '../../app/DBManager';

import GroupTask from '../GroupTask';
// import console = require('console');

/* --- all mock and const --- */

configure({ adapter: new Adapter() });

const card = [
  {
    _id: 'cardId01',
    title: 'test_title01',
    boardId: 'test_boardId01',
    boardTitle: 'test_boardTitle01',
    members: [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }],
    listId: 'test_listId01',
    description: 'test_description01',
  },
  {
    _id: 'cardId02',
    title: 'test_title02',
    boardId: 'test_boardId02',
    boardTitle: 'test_boardTitle02',
    members: [{ member: 'Bob', id: 'mem2_1' }, { member: 'Nick', id: 'mem2_2' }],
    listId: 'test_listId02',
    description: 'test_description02',
  },
];

jest.mock('lodash', () => {
  const lodash = {
    groupBy: jest.fn(),
    sortBy: jest.fn(),
    filter: jest.fn(),
  };
  return lodash;
});

jest.mock('../../constants/config', () => ({
  APPCONFIG: {
    BOARD_EDIT_UPDATE: true,
  },
}));

/* --- props --- */
const boardName = 'test-boardname';
const groupId = 'test-groupID';

/* --- Actions MOCK --- */

jest.mock('react-native-router-flux', () => ({
  Actions: {
    currentScene: 'GroupTasksListScene',
    pop: jest.fn(),
    GroupCardDetails: jest.fn(),
  },
}));

// jest.mock('ListView', () => {
//   const listView = {
//     DataSource: jest.fn(() => ({
//       rowHasChanged: jest.fn(),
//       cloneWithRows: jest.fn(),
//     })),
//   };
//   return listView;
// });

jest.mock('BackHandler', () => {
  const backHandler = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  return backHandler;
});

/* --- DbManager MOCK --- */

jest.mock('../../app/DBManager', () => {
  const dbManager = {
    board: {
      fetchBoardTasks: jest.fn(),
      findBoardByName: jest.fn(),
      findOrCreateByName: jest.fn(),
      addBoardListener: jest.fn(),
      findById: jest.fn(),
      title: 'test_boardTitle',
    },
    lists: {
      fetchBoardList: jest.fn(),
      findByBoardIdAsList: jest.fn(),
      findById: jest.fn(),
    },
    _taskManager: {
      board: {
        fetchBoardTasks: jest.fn(),
        findBoardByName: jest.fn(),
        findOrCreateByName: jest.fn(),
        addBoardListener: jest.fn(),
        findById: jest.fn(),
        title: '_taskManager_boardTitle',
        createList: jest.fn(),
        fetchBoardSwimline: jest.fn(),
        updateList: jest.fn(),
        updateCard: jest.fn(),
        deleteList: jest.fn(),
        deleteCard: jest.fn(),
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
      addCardListener: jest.fn(),
      list: [
        { name: 'cadrd01', boardId: 'boardId01', listId: 'listId01' },
        { name: 'cadrd02', boardId: 'boardId02', listId: 'listId02' },
        { name: 'cadrd03', boardId: 'boardId03', listId: 'listId03' },
      ],
    },
  };
  return dbManager;
});

/* --- Alert --- */

jest.mock('Alert', () => ({
  alert: jest.fn((str1, str2, arr) => {
    arr[0].onPress();
  }),
}));

beforeEach(() => {
  jest.resetModules();
});

/* ---- UT ---- */

/* --- groupTask componentWillUnmount, line_85 --- */
it('groupTask componentWillUnmount', () => {
  DbManager.card.addCardListener.mockClear();
  DbManager.board.addBoardListener.mockClear();
  BackHandler.removeEventListener.mockClear();

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  tree.unmount();

  expect(instance._isMounted).toBe(false);
  expect(DbManager.card.addCardListener).toBeCalled();
  expect(DbManager.board.addBoardListener).toBeCalled();
  expect(BackHandler.removeEventListener).toBeCalled();
});

/* --- setModalVisible is called, line_92 --- */
it('setModalVisible is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ modalVisible: false });
  tree.update();
  expect(tree.state().modalVisible).toBe(false);

  const instance = tree.instance();
  instance.setModalVisible(true);

  expect(tree.state().modalVisible).toBe(true);
});

/* --- setAddListVisible is called, line_96 --- */
it('setAddListVisible is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ addListVisible: false });
  tree.update();
  expect(tree.state().addListVisible).toBe(false);

  const instance = tree.instance();
  instance.setAddListVisible(true);

  expect(tree.state().addListVisible).toBe(true);
});

/* ---- setAddCardVisible is called, line_100 --- */
it('setAddCardVisible is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ addCardVisible: false });
  tree.update();
  expect(tree.state().addCardVisible).toBe(false);

  const instance = tree.instance();
  instance.setAddCardVisible(true);

  expect(tree.state().addCardVisible).toBe(true);
});

/* --- setMoveCardVisible is called, line_104 --- */
it('setMoveCardVisible is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ moveCardVisible: false });
  tree.update();
  expect(tree.state().moveCardVisible).toBe(false);

  const instance = tree.instance();
  instance.setMoveCardVisible(true);

  expect(tree.state().moveCardVisible).toBe(true);
});

/* --- setUpdateListVisible is called, line_108 --- */
it('setUpdateListVisible is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ updateListVisible: false });
  tree.update();
  expect(tree.state().updateListVisible).toBe(false);

  const instance = tree.instance();
  instance.setUpdateListVisible(true);

  expect(tree.state().updateListVisible).toBe(true);
});

/* --- handleBackPress is called, line_112 --- */
it('handleBackPress is called, first if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({
    popUpListNav: true,
    popUpCardNav: false,
    updateListId: 'test_updateListId',
  });
  tree.update();
  const instance = tree.instance();
  instance.handleBackPress();

  expect(tree.state().popUpListNav).toBe(false);
  expect(tree.state().updateListId).toBe('');
  expect(tree.state().popUpCardNav).toBe(false);
});

it('handleBackPress is called, second if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({
    popUpListNav: false,
    popUpCardNav: true,
    cardListId: 'test_cardListId',
    cardCardId: 'test_cardCardId',
  });
  tree.update();
  const instance = tree.instance();
  instance.handleBackPress();

  expect(tree.state().popUpListNav).toBe(false);
  expect(tree.state().popUpCardNav).toBe(false);
  expect(tree.state().cardListId).toBe('');
  expect(tree.state().cardCardId).toBe('');
  expect(tree.state().moveCardTitle).toBe('');
});

it('handleBackPress is called, else case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ popUpListNav: false, popUpCardNav: false });
  tree.update();
  const instance = tree.instance();
  instance.handleBackPress();

  expect(tree.state().popUpListNav).toBe(false);
  expect(tree.state().popUpCardNav).toBe(false);
});

/* --- onEnableScroll is called, line_132 --- */
it('onEnableScroll is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ enableScrollViewScroll: true });
  tree.update();
  const instance = tree.instance();
  instance.onEnableScroll(false);

  expect(tree.state().enableScrollViewScroll).toBe(false);
});

/* --- fetchBoardTasks is called, line_174 --- */
it('fetchBoardTasks is called', () => {
  DbManager.board.fetchBoardTasks.mockClear();
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.fetchBoardTasks();

  expect(DbManager.board.fetchBoardTasks).toBeCalledWith('test-boardname');
});

/* --- fetchBoard, line_179 --- */
it('fetchBoard, both if case', async () => {
  DbManager.board.findBoardByName.mockClear();
  DbManager.lists.fetchBoardList.mockClear();
  DbManager.lists.findByBoardIdAsList.mockClear();
  const board = {
    _id: 'test_board_id',
    name: 'test_borad_name',
  };
  DbManager.board.findBoardByName = jest.fn(() => board);
  DbManager.lists.findByBoardIdAsList = jest.fn(() => board);

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ boardID: 'test_boardID' });
  tree.update();
  const instance = tree.instance();
  await instance.fetchBoard();

  expect(DbManager.lists.fetchBoardList).toBeCalledWith('test_board_id');
  expect(tree.state().board).toEqual(board);
  expect(tree.state().boardID).toBe('test_board_id');

  expect(DbManager.lists.findByBoardIdAsList).toBeCalledWith('test_boardID');
  expect(tree.state().boardList).toEqual(board);
});

it('fetchBoard, both else case', async () => {
  DbManager.board.findBoardByName.mockClear();
  DbManager.lists.fetchBoardList.mockClear();
  DbManager.lists.findByBoardIdAsList.mockClear();
  DbManager.board.findBoardByName = jest.fn(() => null);
  DbManager.lists.findByBoardIdAsList = jest.fn(() => null);

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ boardID: 'test_boardID' });
  tree.update();
  const instance = tree.instance();
  await instance.fetchBoard();

  expect(DbManager.lists.fetchBoardList).not.toBeCalled();
  expect(tree.state().boardID).toBe('test_boardID');

  expect(DbManager.lists.findByBoardIdAsList).toBeCalledWith('test_boardID');
});
/* ==========fetchBoard========== */

/* ++++++++++ createLists, line_229 ++++++++++ */
it('createLists, if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ boardID: 'test_boardID' });
  tree.update();
  const instance = tree.instance();
  instance.fetchBoardTasks = jest.fn();
  const listTitle = 'listTitle_test';
  instance.createLists(listTitle);

  expect(instance.fetchBoardTasks).toBeCalled();
  expect(DbManager._taskManager.board.createList).toBeCalled();
});
/* ==========createLists========== */

/* ++++++++++ createCards, line_242 +++++++++ */
it('createCards, if case', () => {
  DbManager._taskManager.board.fetchBoardSwimline.mockClear();
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ boardID: 'boardID_test' });
  tree.update();

  const instance = tree.instance();
  instance.fetchBoardTasks = jest.fn();
  const cardtitle = 'cardtitle_test';
  const selectedListTitle = 'selectedListTitle_test';
  instance.createCards(cardtitle, selectedListTitle);

  expect(tree.state().boardID).toBe('boardID_test');
  expect(DbManager._taskManager.board.fetchBoardSwimline).toBeCalled();
  expect(instance.fetchBoardTasks).toBeCalled();
});

/* ++++++++++ updateList, line_258 +++++++++ */
it('updateList, if case', () => {
  DbManager._taskManager.board.updateList.mockClear();
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ boardID: 'boardID_test' });
  tree.update();
  const instance = tree.instance();
  instance.fetchBoardTasks = jest.fn();
  const updateListTitle = 'updateListTitle_test';
  const list = [
    { _id: 'list_ID_01', name: 'list_NAME_01' },
    { _id: 'list_ID_01', name: 'list_NAME_01' },
  ];
  instance.updateList(updateListTitle, list);

  expect(tree.state().boardID).toBe('boardID_test');
  expect(DbManager._taskManager.board.updateList).toBeCalled();
  expect(instance.fetchBoardTasks).toBeCalled();
});

/* ++++++++++ moveCard, line_272 ++++++++++ */
it('moveCard, if case', () => {
  DbManager._taskManager.board.updateCard.mockClear();
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({
    boardID: 'boardID_test',
    moveCardTitle: 'moveCardTitle_test',
    cardCardId: 'cardCardId_test',
    cardListId: 'cardListId_test',
  });
  tree.update();
  const instance = tree.instance();
  instance.fetchBoardTasks = jest.fn();
  const selectedListMove = 'selectedListMove_test';
  instance.moveCard(selectedListMove);

  expect(tree.state().boardID).toBe('boardID_test');
  expect(tree.state().moveCardTitle).toBe('moveCardTitle_test');
  expect(tree.state().cardCardId).toBe('cardCardId_test');
  expect(tree.state().cardListId).toBe('cardListId_test');
  expect(DbManager._taskManager.board.updateCard).toBeCalled();
  expect(instance.fetchBoardTasks).toBeCalled();
});

/* ++++++++++ deleteList, line_290 ++++++++++ */
it('deleteList, if case', () => {
  DbManager._taskManager.board.deleteList.mockClear();
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { _id: 'deleteList_Item_ID_01', name: 'boasrdList_name01', title: 'updateListId_test' },
    { _id: 'deleteList_Item_ID_02', name: 'boasrdList_name02', title: 'title02' },
  ];
  tree.setState({
    boardID: 'boardID_test',
    boardList,
    updateListId: 'updateListId_test',
  });
  tree.update();
  const instance = tree.instance();
  instance.fetchBoardTasks = jest.fn();
  instance.deleteList();

  expect(DbManager._taskManager.board.deleteList).toBeCalled();
  expect(instance.fetchBoardTasks).toBeCalled();
});

/* ++++++++++ deleteCard, line_306 +++++++++ */
it('deleteCard, if case', () => {
  DbManager._taskManager.board.deleteCard.mockClear();
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({
    boardID: 'boardID_test',
    cardListId: 'cardListId_test',
    cardCardId: 'cardCardId_test',
  });
  tree.update();
  const instance = tree.instance();
  instance.fetchBoardTasks = jest.fn();
  instance.deleteCard();

  expect(DbManager._taskManager.board.deleteCard).toBeCalled();
  expect(instance.fetchBoardTasks).toBeCalled();
});

/* --- fetchCardDetail is called, line_201 --- */
it('fetchCardDetail is called, if case', () => {
  Actions.currentScene = 'GroupTasksListScene';

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.fetchCardDetail(card);

  expect(Actions.GroupCardDetails).toBeCalled();
});

it('fetchCardDetail is called, else case', () => {
  Actions.currentScene = '';
  Actions.GroupCardDetails.mockClear();

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.fetchCardDetail(card);

  expect(Actions.GroupCardDetails).not.toBeCalled();
});

/* --- keyExtractor, line_213 --- */
it('keyExtractor', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();

  expect(instance.keyExtractor(card[0])).toEqual('cardId01');
});

/* --- renderIcon is called with card.description, line_224 --- */
it('renderIcon is called with card.description, if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  const component = instance.renderIcon(card.description);

  expect(component).toBeTruthy();
});

it('renderIcon is called with card.description, else case', () => {
  card.description = '';
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  const component = instance.renderIcon(card.description);

  expect(component).toBeFalsy();
});

/* +++++++++++++++++++++++++ renderAddList +++++++++++++++++++++++++ */

/* --- Modal props onRequestClose is called, line_334 --- */
it('renderAddList, Modal props onRequestClose is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  const node = shallow(instance.renderAddList());
  // console.log(node.debug());
  instance.setAddListVisible = jest.fn();
  const modal = node.find({ animationType: 'slide' }).first();
  modal.props().onRequestClose();

  expect(instance.setAddListVisible).toBeCalledWith(true);
  expect(instance.setAddListVisible).toBeCalled();
});

/* --- TextInput props onChangeText is called, line_371 --- */
it('renderAddList, TextInput props onChangeText is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ listtitle: '' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderAddList());
  // console.log(node.debug());
  const textInput = node.find({ placeholder: 'New List Title' }).first();
  textInput.props().onChangeText('NewListTitle');

  expect(tree.state().listtitle).toBe('NewListTitle');
});

/* --- TouchableOpacity props onPress is called, if case, line_415 --- */
it('renderAddList, TouchableOpacity(add btn) props onPress is called, if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ listtitle: 'Today_List_Title' });
  tree.update();
  const instance = tree.instance();
  instance.createLists = jest.fn();
  instance.setAddListVisible = jest.fn();
  instance.fetchBoardTasks = jest.fn();
  const node = shallow(instance.renderAddList());
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();

  expect(instance.createLists).toBeCalledWith('Today_List_Title');
  expect(instance.setAddListVisible).toBeCalled();
  expect(instance.fetchBoardTasks).toBeCalled();
  expect(tree.state().listtitle).toBe('');
});

/* --- TouchableOpacity props onPress is called, else case, line_422 --- */
it('renderAddList, TouchableOpacity(add btn) props onPress is called, else case', () => {
  Alert.alert.mockClear();
  jest.mock('Alert', () => ({
    alert: jest.fn(),
  }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ listtitle: '' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderAddList());
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();

  expect(Alert.alert).toBeCalledWith('List title should not be empty');
});

/* --- TouchableOpacity props onPress is called, line_448 --- */
it('renderAddList, TouchableOpacity(Close btn) props onPress is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.setAddListVisible = jest.fn();
  const node = shallow(instance.renderAddList());
  // console.log(node.debug());
  const TO = node.find('TouchableOpacity').at(1);
  TO.props().onPress();

  expect(instance.setAddListVisible).toBeCalled();
});

/* --- TouchableOpacity props onPress is called, line_465 --- */
it('renderAddList, TouchableOpacity(+Add List btn) props onPress is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.setAddListVisible = jest.fn();
  const node = shallow(instance.renderAddList());
  // console.log(node.debug());
  const TO = node.find('TouchableOpacity').last();
  TO.props().onPress();

  expect(instance.setAddListVisible).toBeCalledWith(true);
});
/* =========================renderAddList========================= */

/* +++++++++++++++ renderAddCard +++++++++++++++ */

/* --- first View onStartShouldSetResponderCapture is called, line_501 --- */
it('renderAddCard, onStartShouldSetResponderCapture is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ enableScrollViewScroll: false });
  tree.update();
  expect(tree.state().enableScrollViewScroll).toBe(false);
  const instance = tree.instance();
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const view = node.find('View').first();
  view.props().onStartShouldSetResponderCapture();

  expect(tree.state().enableScrollViewScroll).toBe(true);
});

/* --- first Modal onRequestClose is called, line_509 --- */
it('renderAddCard, Modal onRequestClose is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.setAddCardVisible = jest.fn();
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const modal = node.find({ animationType: 'slide' }).first();
  modal.props().onRequestClose();

  expect(instance.setAddCardVisible).toBeCalled();
});

/* --- first ScrollView prop ref, line_521 --- */
it('first ScrollView prop ref', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance._myScroll = {};
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const scrollView = node.find('ScrollView').first();
  expect(scrollView).toHaveLength(1);
  scrollView.getElement().ref({});

  expect(instance._myScroll).toBeTruthy();
});

/* --- TextInput onChangeText is called, line 550 -- */
it('renderAddCard, TextInput onChangeText is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  expect(tree.state().cardtitle).toBe('');

  const instance = tree.instance();
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const textInput = node.find({ placeholder: 'New Card Title' }).first();
  textInput.props().onChangeText('test-text');

  expect(tree.state().cardtitle).toBe('test-text');
});

/* --- View onStartShouldSetResponderCapture is called, line_579 -- */
it('renderAddCard, View onStartShouldSetResponderCapture is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  expect(tree.state().enableScrollViewScroll).toBe(true);

  const instance = tree.instance();
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const view = node.find('Component').at(3);
  view.props().onStartShouldSetResponderCapture();

  expect(tree.state().enableScrollViewScroll).toBe(false);
});

/* --- View onStartShouldSetResponderCapture is called, if case, line_581 -- */
it('renderAddCard, View onStartShouldSetResponderCapture is called, if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ enableScrollViewScroll: false });
  tree.update();
  expect(tree.state().enableScrollViewScroll).toBe(false);

  const instance = tree.instance();
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const view = node.find('Component').at(3);
  view.props().onStartShouldSetResponderCapture();

  expect(tree.state().enableScrollViewScroll).toBe(true);
});

/* --- FlatList, line_604 --- */
it('renderAddCard, FlatList, TO onPress if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  const cardtitle = 'today';
  tree.setState({ boardList, cardtitle });
  tree.update();
  const instance = tree.instance();
  instance.onEnableScroll = jest.fn();
  const node = shallow(instance.renderAddCard());
  const flatList = node.find('FlatList').first();
  // console.log(node.debug());
  const keyResult = flatList.props().keyExtractor(boardList[0]);
  flatList.props().onTouchStart();
  flatList.props().onMomentumScrollEnd();

  expect(keyResult).toMatch(boardList[0].toString());
  expect(instance.onEnableScroll).toBeCalledTimes(2);

  // renderItem

  const item = shallow(<View>{flatList.props().renderItem({ item: boardList[0] })}</View>).find(
    'TouchableOpacity',
  );
  // console.log(item.debug());
  item.props().onPress();

  expect(tree.state().selectedListTitle).toMatch(boardList[0]._id);
  expect(tree.state().selectedListTitle).toBe('item01');
});

it('renderAddCard, FlatList, TO onPress else case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  const cardtitle = '';
  tree.setState({ boardList, cardtitle, selectedListTitle: 'title' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderAddCard());
  const flatList = node.find('FlatList').first();
  // console.log(node.debug());

  // renderItem

  const item = shallow(<View>{flatList.props().renderItem({ item: boardList[0] })}</View>).find(
    'TouchableOpacity',
  );
  item.props().onPress();

  expect(tree.state().selectedListTitle).toBe('');
});

/* --- FlatList, TO onPress, Text color = true, line_641 --- */
it('renderAddCard, FlatList, TO onPress, Text color = true', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  const cardtitle = 'today';
  tree.setState({ boardList, cardtitle, selectedListTitle: 'item01' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderAddCard());
  const flatList = node.find('FlatList').first();
  // console.log(node.debug());

  // renderItem

  const item = shallow(<View>{flatList.props().renderItem({ item: boardList[0] })}</View>).find(
    'TouchableOpacity',
  );
  // console.log(item.debug());
  item.props().onPress();

  expect(tree.state().selectedListTitle).toMatch(boardList[0]._id);
  expect(tree.state().selectedListTitle).toBe('item01');
});

/* --- TouchableOpacity (Tab_to_refresh-btn) onPress is called, line_661 --- */
it('renderAddCard, TouchableOpacity (Tab_to_refresh-btn) onPress is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = '';
  tree.setState({ boardList });
  tree.update();
  const instance = tree.instance();
  instance.fetchBoard = jest.fn();
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const TO = node.find({ name: 'refresh' }).parent();
  TO.props().onPress();

  expect(instance.fetchBoard).toBeCalled();
});

/* --- View, TouchableOpacity onPress is called, line_697 --- */
it('renderAddCard, View TO(btn Add) onPress is called, if case', () => {
  Alert.alert.mockClear();
  jest.mock('Alert', () => ({
    alert: jest.fn(),
  }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  tree.setState({
    boardList,
    selectedListTitle: 'test_selectedListTitle',
    cardtitle: 'test_cardtitle',
  });
  tree.update();
  const instance = tree.instance();
  instance.createCards = jest.fn();
  instance.setAddCardVisible = jest.fn();
  instance.fetchBoardTasks = jest.fn();
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();

  expect(instance.createCards).toBeCalled();
  expect(instance.setAddCardVisible).toBeCalled();
  expect(instance.fetchBoardTasks).toBeCalled();
  expect(tree.state().selectedListTitle).toBe('');
  expect(tree.state().cardtitle).toBe('');
});

it('renderAddCard, View TO(btn Add) onPress is called, first else-if case', () => {
  Alert.alert.mockClear();

  jest.mock('Alert', () => ({
    alert: jest.fn(),
  }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  tree.setState({ boardList, selectedListTitle: '', cardtitle: 'test_cardtitle' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();

  expect(Alert.alert).toBeCalledWith('Choose List Name to add CARD');
});

it('renderAddCard, View TO(btn Add) onPress is called, second else-if case', () => {
  Alert.alert.mockClear();

  jest.mock('Alert', () => ({
    alert: jest.fn(),
  }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  tree.setState({ boardList, selectedListTitle: 'test_selectedListTitle', cardtitle: '' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();

  expect(Alert.alert).toBeCalledWith('Card title should not be empty');
});

/* --- View, TouchableOpacity onPress is called, line_734 --- */
it('renderAddCard, View TO3(btn Close) onPress is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.setAddCardVisible = jest.fn();
  const node = shallow(instance.renderAddCard());
  // console.log(node.debug());
  const TO2 = node.find('TouchableOpacity').last();
  TO2.props().onPress();

  expect(instance.setAddCardVisible).toBeCalled();
});
/* =========================renderAddCard========================= */

/* ++++++++++++++++++++++++ RenderMoveCard +++++++++++++++++++++++++ */

/* --- View, onStartShouldSetResponderCapture is called, line_770 --- */
it('renderMoveCard, View props onStartShouldSetResponderCapture is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ enableScrollViewScroll: false });
  tree.update();
  expect(tree.state().enableScrollViewScroll).toBe(false);

  const instance = tree.instance();
  const node = shallow(instance.renderMoveCard());
  // console.log(node.debug());
  const view = node.find('View').first();
  view.props().onStartShouldSetResponderCapture();

  expect(tree.state().enableScrollViewScroll).toBe(true);
});

/* --- Modal props onRequestClose is called, line_775 --- */
it('renderMoveCard, Modal props onRequestClose is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.setMoveCardVisible = jest.fn();
  const node = shallow(instance.renderMoveCard());
  // console.log(node.debug());
  const modal = node.find({ animationType: 'slide' }).first();
  modal.props().onRequestClose();

  expect(instance.setMoveCardVisible).toBeCalled();
});

/* --- ScrollView props ref, line_791 --- */
it('renderMoveCard, ScrollView props ref', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance._myScroll = {};
  const node = shallow(instance.renderMoveCard());
  // console.log(node.debug());
  const scrollView = node.find('ScrollView').first();
  expect(scrollView).toHaveLength(1);
  scrollView.getElement().ref({});

  expect(instance._myScroll).toBeTruthy();
});

/* --- FlatList, line_834 --- */
it('renderMoveCard, FlatList, TO onPress if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  const cardtitle = 'today';
  tree.setState({ boardList, cardtitle });
  tree.update();
  const instance = tree.instance();
  instance.onEnableScroll = jest.fn();
  const node = shallow(instance.renderMoveCard());
  const flatList = node.find('FlatList').first();
  // console.log(node.debug());
  const keyResult = flatList.props().keyExtractor(boardList[0]);
  flatList.props().onTouchStart();
  flatList.props().onMomentumScrollEnd();

  expect(keyResult).toMatch(boardList[0].toString());
  expect(instance.onEnableScroll).toBeCalledTimes(2);

  // renderItem

  const item = shallow(<View>{flatList.props().renderItem({ item: boardList[0] })}</View>).find(
    'TouchableOpacity',
  );
  // console.log(item.debug());
  item.props().onPress();

  expect(tree.state().selectedListMove).toMatch(boardList[0]._id);
  expect(tree.state().selectedListMove).toBe('item01');
});

/* --- FlatList, TO onPress, Text color = true, line_865 --- */
it('renderMoveCard, FlatList, TO onPress, Text color = true', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  const cardtitle = 'today';
  tree.setState({ boardList, cardtitle, selectedListMove: 'item01' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderMoveCard());
  const flatList = node.find('FlatList').first();
  // console.log(node.debug());

  // renderItem

  const item = shallow(<View>{flatList.props().renderItem({ item: boardList[0] })}</View>).find(
    'TouchableOpacity',
  );
  // console.log(item.debug());
  item.props().onPress();

  expect(tree.state().selectedListMove).toMatch(boardList[0]._id);
  expect(tree.state().selectedListMove).toBe('item01');
});

/* --- View props onStartShouldSetResponderCapture is called, line_768 --- */
it('renderMoveCard, View props onStartShouldSetResponderCapture is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ enableScrollViewScroll: true });
  tree.update();
  expect(tree.state().enableScrollViewScroll).toBe(true);

  const instance = tree.instance();
  const node = shallow(instance.renderMoveCard());
  const view = node.find('Component').at(3);
  view.props().onStartShouldSetResponderCapture();

  expect(tree.state().enableScrollViewScroll).toBe(false);
});

/* --- View props onStartShouldSetResponderCapture is called, if case line_770 --- */
it('renderMoveCard, View props onStartShouldSetResponderCapture is called, if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ enableScrollViewScroll: false });
  tree.update();
  expect(tree.state().enableScrollViewScroll).toBe(false);

  const instance = tree.instance();
  const node = shallow(instance.renderMoveCard());
  const view = node.find('Component').at(3);
  view.props().onStartShouldSetResponderCapture();

  expect(tree.state().enableScrollViewScroll).toBe(true);
});

/* --- renderMoveCard TO1 is called, line_885 --- */
it('renderMoveCard, TO1 is called, if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({
    popUpCardNav: true,
    cardListId: 'test_cardListId',
    cardCardId: 'test_cardCardId',
    moveCardTitle: 'test_moveCardTitle',
    selectedListMove: 'test_selectedListMove',
  });
  tree.update();
  const instance = tree.instance();
  instance.moveCard = jest.fn();
  instance.setMoveCardVisible = jest.fn();
  instance.fetchBoardTasks = jest.fn();
  const node = shallow(instance.renderMoveCard());
  // console.log(node.debug());
  const TO1 = node.find('TouchableOpacity').first();
  TO1.props().onPress();

  expect(instance.moveCard).toBeCalled();
  expect(instance.setMoveCardVisible).toBeCalled();
  expect(instance.fetchBoardTasks).toBeCalled();
  expect(tree.state().popUpCardNav).toBe(false);
  expect(tree.state().cardListId).toBe('');
  expect(tree.state().cardCardId).toBe('');
  expect(tree.state().moveCardTitle).toBe('');
});

it('renderMoveCard, TO1 is called, else case', () => {
  Alert.alert.mockClear();
  jest.mock('Alert', () => ({
    alert: jest.fn(),
  }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ selectedListMove: '' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderMoveCard());
  // console.log(node.debug());
  const TO1 = node.find('TouchableOpacity').first();
  TO1.props().onPress();

  expect(Alert.alert).toBeCalledWith('Choose List Name to move CARD');
});

/* --- renderMoveCard TO2 is called, line_923 --- */
it('renderMoveCard, TO2 is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.setMoveCardVisible = jest.fn();
  const node = shallow(instance.renderMoveCard());
  const TO3 = node.find('TouchableOpacity').at(1);
  TO3.props().onPress();

  expect(instance.setMoveCardVisible).toBeCalled();
});

/* --- renderMoveCard TO3 is called, line_952 --- */
it('renderMoveCard, TO3 is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.setMoveCardVisible = jest.fn();
  const node = shallow(instance.renderMoveCard());
  const TO3 = node.find('TouchableOpacity').last();
  TO3.props().onPress();

  expect(instance.setMoveCardVisible).toBeCalledWith(true);
});
/* =========================renderMoveCard========================= */

/* +++++++++++++++++++++++++ renderFilterByList +++++++++++++++++++++++++ */

/* --- Modal props onRequestClose is called line_967 --- */
it('renderFilterByList, onRequestClose is called', () => {
  Alert.alert.mockClear();
  jest.mock('Alert', () => ({
    alert: jest.fn(),
  }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  // console.log(tree.debug());
  const mod = shallow(instance.renderFilterByList());
  // console.log(mod.debug());
  const modal = mod.find('Modal').first();
  modal.props().onRequestClose();

  expect(Alert.alert).toBeCalledWith('Modal has been closed.');
});

/* --- FlatList, line_1008 --- */
it('renderFilterByList, FlatList, TO onPress', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
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

  // renderItem

  const listItem = shallow(<View>{flatList.props().renderItem(categoryList[0])}</View>).find(
    'TouchableOpacity',
  );
  listItem.props().onPress();

  expect(instance.filteredList).toBeCalledWith('item1');
  expect(instance.setModalVisible).toBeCalled();
  expect(tree.state().filter).toBe(true);
});

/* --- Text color = true, line_1032 --- */
it('renderFilterByList, FlatList, TO onPress, Text color = true', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
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

  const listItem = shallow(<View>{flatList.props().renderItem(categoryList[0])}</View>).find(
    'TouchableOpacity',
  );
  listItem.props().onPress();

  expect(tree.state().filter).toBe(true);
});

/* --- renderFilterByList TO is called, line_1043 --- */
it('renderFilterByList TO(Close btn) is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.setModalVisible = jest.fn();
  instance.renderFilterByList();
  // console.log(tree.debug());
  const TO = tree.find('TouchableOpacity').first();
  TO.props().onPress();

  expect(instance.setModalVisible).toBeCalled();
});
/* =========================renderFilterByList========================= */

/* +++++++++++++++++++++++++ renderCards +++++++++++++++++++++++++ */

/* --- renderCards, TO1 onPress is called, if case, onLongPress is called line_1075 --- */
it('renderCards, TO onPress, onLongPress is called, if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ popUpCardNav: false, popUpListNav: false });
  tree.update();
  const instance = tree.instance();
  instance.renderListAvatar = jest.fn();
  instance.fetchCardDetail = jest.fn();
  const node = shallow(instance.renderCards({ item: card[0] }));
  // console.log(node.debug());
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();
  TO.props().onLongPress();

  expect(instance.fetchCardDetail).toBeCalled();
  expect(tree.state().popUpCardNav).toBe(true);
  expect(tree.state().popUpListNav).toBe(false);
  expect(tree.state().updateListId).toBe('');
  expect(tree.state().cardListId).toBe('test_listId01');
  expect(tree.state().cardListId).toMatch(card[0].listId);
  expect(tree.state().cardCardId).toBe('cardId01');
  expect(tree.state().cardCardId).toMatch(card[0]._id);
  expect(tree.state().moveCardTitle).toBe('test_title01');
  expect(tree.state().moveCardTitle).toMatch(card[0].title);
});

/* --- renderCards, TO1 onPress is called, else case, onLongPress is called line_1075 --- */
it('renderCards, TO onPress, onLongPress is called, else case', () => {
  Application.APPCONFIG.BOARD_EDIT_UPDATE = false;
  card[0].members = '';

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ popUpCardNav: true, popUpListNav: true, cardCardId: 'cardId01' });
  tree.update();
  const instance = tree.instance();
  instance.renderListAvatar = jest.fn();
  instance.fetchCardDetail = jest.fn();
  const node = shallow(instance.renderCards({ item: card[0] }));
  // console.log(node.debug());
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();
  TO.props().onLongPress();

  expect(instance.fetchCardDetail).not.toBeCalled();

  expect(tree.state().popUpCardNav).toBe(false);
  expect(tree.state().popUpListNav).toBe(false);
  expect(tree.state().updateListId).toBe('');
  expect(tree.state().cardListId).toBe('test_listId01');
  expect(tree.state().cardListId).toMatch(card[0].listId);
  expect(tree.state().cardCardId).toBe('');
  expect(tree.state().moveCardTitle).toBe('test_title01');
  expect(tree.state().moveCardTitle).toMatch(card[0].title);
});

/* --- renderCards, mem=false, item.description=true line_1112 --- */
it('renderCards, mem=false, item.description=true, null case', () => {
  card[0].members = '';
  card[0].description = '';

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  const node = shallow(instance.renderCards({ item: card[0] }));
  // console.log(node.debug());
  const view = node.find({ style: { borderColor: '#D9E9FF' } });

  expect(view.length).toBe(0);
});

/* --- renderCards, commentCount = true, line_1115,  checklistCount = true line_1127 --- */
it('renderCards, commentCount = true, checklistCount = true ', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ commentCount: 5, checklistCount: 7 });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderCards({ item: card[0] }));

  expect(node.find({ name: 'comment-text-outline' })).toBeTruthy();
  expect(node.find({ name: 'checkbox-marked-outline' })).toBeTruthy();
});

/* =========================renderCards========================= */

/* ++++++++ renderMembers  line_1146 ++++++++++ */
it('renderMembers, if cases', () => {
  const member = {
    id: 123,
    name: 'bob',
    avatarURL: 'https:awensome_avatar',
  };
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.renderMembers(member);

  expect(DbManager.user.findById).toBeCalled();
});

it('renderMembers, first else case', () => {
  DbManager.user.findById.mockClear();
  const member = '';
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
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
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.renderMembers(member);

  expect(DbManager.user.findById).toBeCalled();
  expect(instance.renderMembers(member)).toBeFalsy();
});
/* =======================renderMembers====================== */

/* +++++++++ renderRowAvatar, line_1160 ++++++++ */
it('renderRowAvatar', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  const rowData = 'rowData_test';
  instance.renderMembers = jest.fn();
  instance.renderRowAvatar(rowData);

  expect(instance.renderMembers).toBeCalledWith('rowData_test');
});

/* +++++++ renderUpdateListTitle, line_1185 +++++++ */

/* --- Modal onRequestClose & TO onPress are called, line_1200, 1211 --- */
it('renderUpdateListTitle, if case, Modal onRequestClose & TO onPress are called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  tree.setState({ boardList, updateListTitle: '', updateListVisible: false, updateListId: '' });
  tree.update();
  const instance = tree.instance();
  instance.setUpdateListVisible = jest.fn();
  const node = shallow(instance.renderUpdateListTitle());
  // console.log(node.debug());
  const modal = node.find({ animationType: 'slide' }).first();
  modal.props().onRequestClose();
  const TO = node.find('TouchableOpacity').first();
  TO.props().onPress();

  expect(instance.setUpdateListVisible).toBeCalledTimes(2);
});

/* --- TextInput props onChangeText is called, line_1243 --- */
it('renderUpdateListTitle, TextInput props onChangeText is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  tree.setState({ boardList, updateListTitle: '', updateListVisible: false, updateListId: '' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderUpdateListTitle());
  // console.log(node.debug());
  const textInput = node.find({ placeholder: 'Edit Title' });
  textInput.props().onChangeText('new_text');

  expect(tree.state().updateListTitle).toBe('new_text');
});

/* --- TouchableOpacity props onPress is called, line_1274 --- */
it('renderUpdateListTitle, TO(Edit btn) props onPress is called, if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  tree.setState({
    boardList,
    updateListTitle: 'new_text',
    updateListVisible: false,
    updateListId: 'test_listID',
    popUpListNav: true,
  });
  tree.update();
  const instance = tree.instance();
  instance.updateList = jest.fn();
  instance.setUpdateListVisible = jest.fn();
  instance.fetchBoardTasks = jest.fn();
  const node = shallow(instance.renderUpdateListTitle());
  // console.log(node.debug());
  const TO = node.find('TouchableOpacity').at(1);
  TO.props().onPress();

  expect(instance.updateList).toBeCalled();
  expect(instance.setUpdateListVisible).toBeCalled();
  expect(instance.fetchBoardTasks).toBeCalled();
  expect(tree.state().popUpListNav).toBe(false);
  expect(tree.state().updateListId).toBe('');
  expect(tree.state().updateListTitle).toBe('');
});

it('renderUpdateListTitle, TO(Edit btn) props onPress is called, else case', () => {
  Alert.alert.mockClear();
  jest.mock('Alert', () => ({
    alert: jest.fn(),
  }));
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  tree.setState({ boardList, updateListTitle: '' });
  tree.update();
  const instance = tree.instance();
  const node = shallow(instance.renderUpdateListTitle());
  // console.log(node.debug());
  const TO = node.find('TouchableOpacity').at(1);
  TO.props().onPress();

  expect(Alert.alert).toBeCalledWith('List title should not be empty');
});

/* --- TouchableOpacity props onPress is called, line_1313 --- */
it('renderUpdateListTitle, TO3 props onPress is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardList = [
    { key: 1, _id: 'item01', title: 'item1' },
    { key: 2, _id: 'item02', title: 'item2' },
  ];
  tree.setState({
    boardList,
    updateListTitle: 'new_text',
    updateListVisible: false,
    updateListId: 'test_listID',
    popUpListNav: true,
  });
  tree.update();
  const instance = tree.instance();
  instance.setUpdateListVisible = jest.fn();
  const node = shallow(instance.renderUpdateListTitle());
  // console.log(node.debug());
  const TO = node.find({ name: 'square-edit-outline' }).parent();
  TO.props().onPress();

  expect(instance.setUpdateListVisible).toBeCalledWith(true);
});
/* =========================renderUpdateListTitle========================= */

/* --- first Navbar TO onPress is called line_1369 --- */
it('groupTask first NavBar TO is called, if case', () => {
  Actions.currentScene = 'GroupTasksListScene';
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  // console.log(tree.debug());
  const navbar = tree.find('NavBar').first();
  const TO = navbar
    .shallow()
    .find('TouchableOpacity')
    .first();
  // console.log(navbar.shallow().debug());
  TO.props().onPress();

  expect(Actions.currentScene).toBe('GroupTasksListScene');
  expect(Actions.pop).toBeCalled();
});

it('groupTask first NavBar TO is called, else case', () => {
  Actions.currentScene = '';
  Actions.pop.mockClear();
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const navbar = tree.find('NavBar').first();
  const TO = navbar
    .shallow()
    .find('TouchableOpacity')
    .first();
  TO.props().onPress();

  expect(Actions.currentScene).toBe('');
  expect(Actions.pop).not.toBeCalled();
});

/* --- second TO onPress is called, line_1385 --- */
it('groupTask first NavBar TO2 is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.fetchBoardTasks = jest.fn();
  instance.fetchBoard = jest.fn();
  const navbar = tree.find('NavBar').first();
  const TO2 = navbar
    .shallow()
    .find({ name: 'refresh' })
    .first()
    .parent();
  TO2.props().onPress();

  expect(instance.fetchBoardTasks).toBeCalled();
  expect(instance.fetchBoard).toBeCalled();
});

/* --- third TO onPress is called, line_1399 --- */
it('groupTask first NavBar TO3 is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance.setAddCardVisible = jest.fn();
  const navbar = tree.find('NavBar').first();
  const TO3 = navbar
    .shallow()
    .find({ name: 'addfile' })
    .first()
    .parent();
  TO3.props().onPress();

  expect(instance.setAddCardVisible).toBeCalledWith(true);
});

/* -- second NavBar TO1 onPress is called, line_1425 --- */
it('groupTask second NavBar TO1 is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ popUpCardNav: true });
  tree.update();

  expect(tree.state().popUpCardNav).toBe(true);

  const navbar = tree.find('NavBar').first();
  const TO = navbar
    .shallow()
    .find('TouchableOpacity')
    .first();
  TO.props().onPress();

  expect(tree.state().popUpCardNav).toBe(false);
  expect(tree.state().cardListId).toBe('');
  expect(tree.state().cardCardId).toBe('');
  expect(tree.state().moveCardTitle).toBe('');
});

/* --- second NavBar TO2 onPress is called, line_1441 --- */
it('groupTask second NavBar TO2 is called, Alert = NO', () => {
  Alert.alert.mockClear();

  jest.mock('Alert', () => ({
    alert: jest.fn((str1, str2, arr) => {
      arr[0].onPress();
    }),
  }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ popUpCardNav: true });
  tree.update();

  expect(tree.state().popUpCardNav).toBe(true);
  const navbar = tree.find('NavBar').first();
  const TO2 = navbar
    .shallow()
    .find({ name: 'trash-o' })
    .first()
    .parent();
  TO2.props().onPress();

  expect(Alert.alert).toBeCalled();
});

it('groupTask second NavBar TO2 is called, Alert = YES', () => {
  Alert.alert.mockClear();

  jest.mock('Alert', () => ({
    alert: jest.fn((str1, str2, arr) => {
      arr[1].onPress();
    }),
  }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ popUpCardNav: true });
  tree.update();
  expect(tree.state().popUpCardNav).toBe(true);

  const instance = tree.instance();
  instance.deleteCard = jest.fn();
  instance.fetchBoardTasks = jest.fn();

  const navbar = tree.find('NavBar').first();
  const TO2 = navbar
    .shallow()
    .find({ name: 'trash-o' })
    .first()
    .parent();
  TO2.props().onPress();

  expect(Alert.alert).toBeCalled();
  expect(instance.deleteCard).toBeCalled();
  expect(tree.state().popUpCardNav).toBe(false);
  expect(tree.state().cardListId).toBe('');
  expect(tree.state().cardCardId).toBe('');
  expect(tree.state().moveCardTitle).toBe('');
  expect(instance.fetchBoardTasks).toBeCalled();
});

/* --- third NavBar TO1 onPress is called, line_1483 --- */
it('groupTask third NavBar TO1 is called', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ popUpCardNav: false, popUpListNav: true });
  tree.update();
  expect(tree.state().popUpCardNav).toBe(false);
  expect(tree.state().popUpListNav).toBe(true);

  const navbar = tree.find('NavBar').first();
  const TO = navbar
    .shallow()
    .find('TouchableOpacity')
    .first();
  TO.props().onPress();

  expect(tree.state().popUpListNav).toBe(false);
  expect(tree.state().updateListId).toBe('');
});

/* --- third NavBar TO2 onPress is called, line_1497 --- */
it('groupTask third NavBar TO2 is called, Alert = NO', () => {
  jest.mock('Alert', () => ({
    alert: jest.fn((str1, str2, arr) => {
      arr[0].onPress();
    }),
  }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ popUpCardNav: false, popUpListNav: true });
  tree.update();
  expect(tree.state().popUpCardNav).toBe(false);
  expect(tree.state().popUpListNav).toBe(true);

  const navbar = tree.find('NavBar').first();
  const TO2 = navbar
    .shallow()
    .find({ name: 'trash-o' })
    .first()
    .parent();
  TO2.props().onPress();

  expect(Alert.alert).toBeCalled();
});

it('groupTask third NavBar TO2 is called, Alert = YES', () => {
  jest.mock('Alert', () => ({
    alert: jest.fn((str1, str2, arr) => {
      arr[1].onPress();
    }),
  }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ popUpCardNav: false, popUpListNav: true });
  tree.update();
  expect(tree.state().popUpCardNav).toBe(false);
  expect(tree.state().popUpListNav).toBe(true);

  const instance = tree.instance();
  instance.deleteList = jest.fn();
  instance.fetchBoardTasks = jest.fn();

  const navbar = tree.find('NavBar').first();
  const TO2 = navbar
    .shallow()
    .find({ name: 'trash-o' })
    .first()
    .parent();
  TO2.props().onPress();

  expect(Alert.alert).toBeCalled();
  expect(instance.deleteList).toBeCalled();
  expect(tree.state().popUpListNav).toBe(false);
  expect(tree.state().updateListId).toBe('');
  expect(instance.fetchBoardTasks).toBeCalled();
});

/* --- renderMain if case line_1380 --- */
it('renderMain if case, filter = false', () => {
  DbManager.board.title = boardName;

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ board: { title: boardName } });
  tree.update();
  const instance = tree.instance();
  instance.renderBoards = jest.fn();
  instance.renderMain();

  expect(tree.state().board.title).toBe('test-boardname');
  expect(tree.state().filter).toBe(false);
  expect(instance.renderBoards).toBeCalled();
});

it('renderMain if case, filter = true', () => {
  DbManager.board.title = boardName;
  Application.APPCONFIG.BOARD_EDIT_UPDATE = true;

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  tree.setState({ board: { title: boardName }, filter: true });
  tree.update();
  const instance = tree.instance();
  instance.renderFilterList = jest.fn();
  instance.renderAddList = jest.fn();
  instance.renderMain();

  expect(tree.state().board.title).toBe('test-boardname');
  expect(tree.state().filter).toBe(true);
  expect(instance.renderFilterList).toBeCalled();
  expect(instance.renderAddList).toBeCalled();
});
/* ==========renderMain========= */

/* ++++++++++ renderFilterList +++++++++ */

/* --- renderFilterList, if case, line_1400 --- */
it('renderFilterList, if case', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardsOfCards = ['test_boardsOfCards_01', 'test_boardsOfCards_02'];
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
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
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
/* ==========renderFilterList=========== */

/* ++++++++++ renderBoards +++++++++++*/

/* --- renderBoards, line_1321 --- */
it('renderBoards, Application =true', () => {
  Application.APPCONFIG.BOARD_EDIT_UPDATE = true;
  _.groupBy = jest.fn(() => ({ title01: 'title01', title02: 'title02' }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardID = 'test_boardId01';
  const updateListId = 'test_updateListId';
  const dataSource = [
    {
      _id: 'cardId01',
      title: 'test_title01',
      boardId: 'test_boardId01',
      boardTitle: 'test_boardTitle01',
      members: [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }],
      listId: 'test_listId01',
      description: 'test_description01',
    },
    {
      _id: 'cardId02',
      title: 'test_title02',
      boardId: 'test_boardId02',
      boardTitle: 'test_boardTitle02',
      members: [{ member: 'Bob', id: 'mem2_1' }, { member: 'Nick', id: 'mem2_2' }],
      listId: 'test_listId02',
      description: 'test_description02',
    },
  ];
  tree.setState({ boardID, updateListId, dataSource });
  tree.update();
  const instance = tree.instance();
  const node = shallow(<View>{instance.renderBoards()}</View>);

  const TO = node.find('TouchableOpacity').first();
  TO.props().onLongPress();

  expect(tree.state().popUpListNav).toBe(true);
  expect(tree.state().popUpCardNav).toBe(false);
  expect(tree.state().cardCardId).toBe('');
  expect(tree.state().updateListId).toBe('title01');
  expect(tree.state().updateListTitle).toBe('title01');
});

it('renderBoards, Application = false', () => {
  Application.APPCONFIG.BOARD_EDIT_UPDATE = false;
  _.groupBy = jest.fn(() => ({ title01: 'title01', title02: 'title02' }));

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const boardID = 'test_boardId01';
  const updateListId = 'title01';
  const dataSource = [
    {
      _id: 'cardId01',
      title: 'test_title01',
      boardId: 'test_boardId01',
      boardTitle: 'test_boardTitle01',
      members: [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }],
      listId: 'test_listId01',
      description: 'test_description01',
    },
    {
      _id: 'cardId02',
      title: 'test_title02',
      boardId: 'test_boardId02',
      boardTitle: 'test_boardTitle02',
      members: [{ member: 'Bob', id: 'mem2_1' }, { member: 'Nick', id: 'mem2_2' }],
      listId: 'test_listId02',
      description: 'test_description02',
    },
  ];
  tree.setState({ boardID, updateListId, dataSource });
  tree.update();
  const instance = tree.instance();
  const node = shallow(<View>{instance.renderBoards()}</View>);

  const TO = node.find('TouchableOpacity').first();
  TO.props().onLongPress();

  expect(tree.state().popUpListNav).toBe(false);
  expect(tree.state().popUpCardNav).toBe(false);
  expect(tree.state().cardCardId).toBe('');
  expect(tree.state().updateListId).toBe('');
  expect(tree.state().updateListTitle).toBe('title01');
});

/* ===========renderBoards========== */

//     members: [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }]

/* ++++++++++ renderListAvatar, line_1165 ++++++++++ */
it('renderListAvatar', () => {
  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  const data = [{ member: 'Bob', id: 'mem1' }, { member: 'Nick', id: 'mem2' }];
  const mem = JSON.stringify(data);

  const node = shallow(instance.renderListAvatar(mem));
  // console.log(node);
  const lv = node.find('ListView');

  expect(lv).toBeTruthy();
});

/* ++++++++++ updateBoardList, line_138 ++++++++++ */
it('updateBoardList', async () => {
  DbManager.board.findById.mockClear();
  DbManager.board.findById = jest.fn(() => 'boardTITLE');
  DbManager.lists.findById.mockClear();
  DbManager.lists.findById = jest.fn(() => 'listsTITLE');

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();

  await instance.updateBoardList();

  expect(DbManager.board.findById).toBeCalled();
  expect(DbManager.lists.findById).toBeCalled();
});

it('updateBoardList, first if case', async () => {
  DbManager.board.findById.mockClear();
  DbManager.board.findById = jest.fn(() => 'boardTITLE');
  DbManager.lists.findById.mockClear();
  DbManager.lists.findById = jest.fn(() => 'listsTITLE');

  const tree = shallow(<GroupTask boardName={boardName} groupId={groupId} />);
  const instance = tree.instance();
  instance._isMounted = false;

  await instance.updateBoardList();

  expect(DbManager.board.findById).not.toBeCalled();
  expect(DbManager.lists.findById).not.toBeCalled();
});
