import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Alert,
  ListView,
  BackHandler,
  Keyboard,
  Dimensions,
} from 'react-native';
import { styles } from 'react-native-theme';
import { iOSColors } from 'react-native-typography';
import { Actions } from 'react-native-router-flux';
import { TabView, TabBar } from 'react-native-tab-view';
import {
  NavBar,
  Text,
  Screen,
  Icon,
  Avatar,
  TextInput,
  AntDesignIcon,
  EvilIcon,
  FontAwesomeIcon,
} from '@ui/components';
import { Colors } from '@ui/theme_default';
import PropTypes from 'prop-types';
import _ from 'lodash';
// import DBManager from '../app/DBManager';
import {DBManager} from 'app-module';
import {Application} from '@mongrov/config';

export default class GroupTask extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
  }

  state = {
    dataSource: [],
    board: {},
    boardsOfCards: [],
    categoryList: [],
    modalVisible: false,
    addListVisible: false,
    addCardVisible: false,
    moveCardVisible: false,
    updateListVisible: false,
    listWithFilter: [],
    filter: false,
    selectedListName: '',
    cardtitle: '',
    listtitle: '',
    updateListTitle: '',
    selectedListTitle: '',
    selectedListMove: '',
    popUpCardNav: false,
    cardListId: '',
    cardCardId: '',
    popUpListNav: false,
    updateListId: '',
    firstListId: '',
    toggleView: false,
    index: 0,
    tabListCard: '',
    routes: [{ key: '', title: '' }],

    // dummy data for icon
    commentCount: null,
    checklistCount: null,
    enableScrollViewScroll: true,
    boardList: [],
  };

  componentWillMount = () => {
    const { boardName, groupId } = this.props;
    const groupData = {
      groupID: groupId,
      groupName: boardName,
    };
    DBManager.board.findOrCreateByName(groupData);
    DBManager.board.fetchBoardTasks(boardName);
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  };

  componentDidMount = () => {
    this._isMounted = true;
    DBManager.card.addCardListener(this.updateBoardList);
    DBManager.lists.addListsListener(this.fetchList);
    DBManager.board.addBoardListener(this.fetchBoard);
  };

  componentWillUnmount = () => {
    this._isMounted = false;
    DBManager.card.removeCardListener(this.updateBoardList);
    DBManager.board.removeBoardListener(this.fetchBoard);
    DBManager.lists.removeListsListener(this.fetchList);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  };

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  setAddListVisible(visible) {
    this.setState({ addListVisible: visible });
  }

  setAddCardVisible(visible) {
    this.setState({ addCardVisible: visible });
  }

  setMoveCardVisible(visible) {
    this.setState({ moveCardVisible: visible });
  }

  setUpdateListVisible(visible) {
    this.setState({ updateListVisible: visible });
  }

  handleBackPress = () => {
    const { popUpListNav, popUpCardNav } = this.state;
    if (popUpListNav) {
      this.setState({
        popUpListNav: false,
        updateListId: '',
      });
      return true;
    }
    if (popUpCardNav) {
      this.setState({
        popUpCardNav: false,
        cardListId: '',
        cardCardId: '',
        moveCardTitle: '',
      });
      return true;
    }
  };

  onEnableScroll = (value) => {
    this.setState({
      enableScrollViewScroll: value,
    });
  };

  updateBoardList = async () => {
    if (!this._isMounted) return;
    const { index } = this.state;
    const { list } = DBManager.card;
    const cardArray = Object.keys(list).map((c) => list[c]);
    const boardsOfCards = [];
    const cardWithDetails = [];
    const listOfCards = [];
    const boardDetailsArray = [];
    const listDetailsArray = [];
    cardArray.forEach((el) => {
      cardWithDetails.push({
        ...el,
        boardTitle: DBManager.board.findById(el.boardId).title,
        listTitle: DBManager.lists.findById(el.listId).title,
      });
    });
    cardArray.forEach((el) => {
      if (!boardsOfCards.includes(el.boardId)) boardsOfCards.push(el.boardId);
      if (!listOfCards.includes(el.listId)) listOfCards.push(el.listId);
    });
    boardsOfCards.forEach((el) => {
      boardDetailsArray.push(DBManager.board.findById(el));
    });
    listOfCards.forEach((el) => {
      listDetailsArray.push(DBManager.lists.findById(el));
    });

    const filterByList = _.groupBy(cardWithDetails, 'listTitle');
    const listNames = Object.keys(filterByList);
    this.setState({
      dataSource: cardWithDetails,
      boardsOfCards: boardDetailsArray,
      categoryList: listNames,
    });
    this.sortGroupListByName(index);
  };

  fetchBoardTasks = () => {
    const { boardName } = this.props;
    DBManager.board.fetchBoardTasks(boardName);
  };

  fetchBoard = async () => {
    const { boardName } = this.props;
    const boardData = await DBManager.board.findBoardByName(boardName);
    if (boardData) {
      DBManager.lists.fetchBoardList(boardData._id);
      this.setState({
        board: boardData,
        boardID: boardData._id,
      });
    }
  };

  fetchList = async () => {
    const { boardID, boardList } = this.state;
    const listData = await DBManager.lists.findByBoardIdAsList(boardID);
    if (listData) {
      this.setState({ boardList: listData }, () => {
        const sortedList = _.sortBy(boardList, 'sort');
        const filterByList = _.groupBy(sortedList, '_id');
        const listId = Object.keys(filterByList);
        this.setState({
          firstListId: listId[0],
        });
      });
    }
  };

  fetchCardDetail = (item) => {
    const { groupId } = this.props;
    if (Actions.currentScene === 'GroupTasksListScene') {
      Actions.GroupCardDetails({
        cardId: item._id,
        boardId: item.boardId,
        boardName: item.boardTitle,
        groupID: groupId,
      });
    }
  };

  keyExtractor = (item) => item._id;

  filteredList = (listName) => {
    const { dataSource, routes } = this.state;
    console.log(routes);
    const filterList = _.filter(dataSource, { listTitle: listName });
    this.setState({
      listWithFilter: filterList,
      selectedListName: listName,
    });
  };

  renderIcon = (description) => {
    if (description !== '' && description !== null) {
      return (
        <View style={styles.cIcon}>
          <Icon name="text" type="material-community" color={Colors.ICON_CARD} size={18} />
        </View>
      );
    }
  };

  sortGroupListByName = (index) => {
    const { dataSource, boardID } = this.state;
    const data = dataSource.filter((card) => card.boardId === boardID);
    if (data.length > 0) {
      const sortedList = _.sortBy(data, 'listSort');
      const obj = [];
      const filterByList = _.groupBy(sortedList, 'listTitle');
      const listId = Object.keys(filterByList);
      const listGetCard = listId[index];
      const matchCards = dataSource.filter((card) => card.listTitle === listGetCard);
      const sortedCards = _.sortBy(matchCards, 'sort');
      if (listId) {
        listId.map((listids) => obj.push({ key: listids, title: listids }));
        this.setState({
          routes: obj,
          tabListCard: sortedCards,
        });
      }
    }
  };

  createLists(listTitle) {
    const { boardID } = this.state;
    const listToSave = {
      title: listTitle,
      boardId: boardID,
    };
    const { board } = DBManager._taskManager;
    if (listToSave) {
      board.createList(listToSave);
      this.fetchBoardTasks();
    }
  }

  createCards(cardtitle, cardAddedList) {
    const { boardID } = this.state;
    const cardToSave = {
      title: cardtitle,
      description: '',
      authorId: DBManager.app.userId,
      listId: cardAddedList,
      boardId: boardID,
    };
    const { board } = DBManager._taskManager;
    if (cardToSave) {
      board.fetchBoardSwimline(cardToSave);
      setTimeout(() => {
        this.fetchBoardTasks();
      }, 1000);
    }
  }

  updateList(updateListTitle, list) {
    const { boardID } = this.state;
    const listToUpdate = {
      title: updateListTitle,
      boardId: boardID,
      listId: list[0]._id,
    };
    const { board } = DBManager._taskManager;
    if (listToUpdate) {
      board.updateList(listToUpdate);
      this.fetchBoardTasks();
    }
  }

  moveCard(selectedListMove) {
    const { boardID, moveCardTitle, cardCardId, cardListId } = this.state;
    const cardToMove = {
      title: moveCardTitle,
      cardId: cardCardId,
      description: '',
      authorId: DBManager.app.userId,
      listId: cardListId,
      movelistId: selectedListMove,
      boardId: boardID,
    };
    const { board } = DBManager._taskManager;
    if (cardToMove) {
      board.updateCard(cardToMove);
      setTimeout(() => {
        this.fetchBoardTasks();
      }, 1000);
    }
  }

  deleteList() {
    const { boardID, boardList, updateListId } = this.state;
    if (boardList) {
      const list = boardList.filter((lists) => lists.title === updateListId);
      const cardDelete = {
        listId: list[0]._id,
        boardId: boardID,
      };
      const { board } = DBManager._taskManager;
      if (cardDelete) {
        board.deleteList(cardDelete);
        this.fetchBoardTasks();
      }
    }
  }

  deleteCard() {
    const { boardID, cardListId, cardCardId } = this.state;
    const cardDelete = {
      cardId: cardCardId,
      authorId: DBManager.app.userId,
      listId: cardListId,
      boardId: boardID,
    };
    const { board } = DBManager._taskManager;
    if (cardDelete) {
      board.deleteCard(cardDelete);
      this.fetchBoardTasks();
    }
  }

  renderAddList = () => {
    const { addListVisible, listtitle } = this.state;
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={addListVisible}
          onRequestClose={() => {
            this.setAddListVisible(!addListVisible);
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
          >
            <View
              style={{
                height: 200,
                width: 300,
                backgroundColor: '#FFF',
                flexDirection: 'column',
              }}
            >
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                  backgroundColor: '#F5F5F5',
                }}
              >
                <Text
                  style={{
                    color: '#000',
                    fontSize: 20,
                  }}
                >
                  Create List
                </Text>
              </View>
              <TextInput
                placeholder="New List Title"
                onChangeText={(text) => this.setState({ listtitle: text })}
                style={{
                  paddingHorizontal: 20,
                  margin: 1,
                  fontSize: 16,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: 'rgba(0,0,0,0.2)',
                  backgroundColor: 'rgba(0,0,0,0)',
                  color: '#222',
                  fontFamily: 'OpenSans-Regular',
                  marginVertical: 5,
                  marginHorizontal: 5,
                  height: 80,
                  textAlignVertical: 'top',
                }}
                multiline
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  marginVertical: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    // paddingVertical: 10,
                    height: 30,
                    backgroundColor: Colors.NAV_ICON,
                    borderWidth: 1,
                    borderColor: 'transparent',
                    paddingHorizontal: 25,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    if (listtitle) {
                      this.createLists(listtitle);
                      this.setAddListVisible(!addListVisible);
                      this.setState({
                        listtitle: '',
                      });
                    } else {
                      Alert.alert('List title should not be empty');
                    }
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFF',
                      fontSize: 14,
                    }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    // paddingVertical: 10,
                    height: 30,
                    backgroundColor: Colors.NAV_ICON,
                    borderWidth: 1,
                    borderColor: 'transparent',
                    paddingHorizontal: 25,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    this.setAddListVisible(!addListVisible);
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFF',
                      fontSize: 14,
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  renderAddCard = () => {
    const {
      addCardVisible,
      cardtitle,
      enableScrollViewScroll,
      boardList,
      selectedListTitle,
    } = this.state;
    return (
      <View
        onStartShouldSetResponderCapture={() => {
          this.setState({ enableScrollViewScroll: true });
        }}
      >
        <Modal
          animationType="slide"
          transparent={true}
          visible={addCardVisible}
          onRequestClose={() => {
            this.setAddCardVisible(!addCardVisible);
          }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
            scrollEnabled={enableScrollViewScroll}
            ref={(myScroll) => this._myScroll === myScroll}
          >
            <View
              style={{
                height: 400,
                width: 300,
                backgroundColor: '#FFF',
                flexDirection: 'column',
              }}
            >
              {/* <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                  backgroundColor: '#F5F5F5',
                }}
              >
                <Text
                  style={{
                    color: Colors.NAV_ICON,
                    fontSize: 16,
                  }}
                >
                  Add Card
                </Text>
              </View> */}
              {/* <TextInput
                placeholder="New Card Title"
                onChangeText={(text) => this.setState({ cardtitle: text })}
                style={{
                  paddingHorizontal: 10,
                  fontSize: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: 'rgba(0,0,0,0.2)',
                  backgroundColor: 'rgba(0,0,0,0)',
                  color: '#222',
                  fontFamily: 'OpenSans-Regular',
                  marginVertical: 5,
                  marginHorizontal: 5,
                  height: 80,
                  textAlignVertical: 'top',
                }}
                multiline
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                autoCorrect={false}
              /> */}
              <View
                style={{
                  marginHorizontal: 5,
                  flex: 1,
                  borderRadius: 10,
                  marginVertical: 5,
                  borderWidth: 1,
                  borderColor: 'transparent',
                }}
                onStartShouldSetResponderCapture={() => {
                  this.setState({ enableScrollViewScroll: false });
                  if (enableScrollViewScroll === false) {
                    this.setState({ enableScrollViewScroll: true });
                  }
                }}
              >
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                    backgroundColor: '#F5F5F5',
                  }}
                >
                  <Text
                    style={{
                      color: '#000',
                      fontSize: 16,
                    }}
                  >
                    Add to
                  </Text>
                </View>
                {boardList && (
                  <FlatList
                    keyExtractor={(index) => index.toString()}
                    data={boardList}
                    onTouchStart={() => {
                      this.onEnableScroll(false);
                    }}
                    onMomentumScrollEnd={() => {
                      this.onEnableScroll(true);
                    }}
                    contentContainerStyle={{
                      flexGrow: 1,
                      backgroundColor: '#F5F5F5',
                    }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{
                          height: 40,
                          backgroundColor: '#F5F5F5',
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingVertical: 10,
                        }}
                        key={item.key}
                        onPress={() => {
                          if (cardtitle.length > 0) {
                            this.setState({
                              selectedListTitle: item._id,
                            });
                          } else {
                            this.setState({
                              selectedListTitle: '',
                            });
                          }
                        }}
                      >
                        <Text
                          style={{
                            color: selectedListTitle === item._id ? '#2E88FF' : iOSColors.gray,
                            fontSize: 14,
                            paddingHorizontal: 20,
                          }}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
                {!boardList && (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        this.fetchBoard();
                      }}
                    >
                      <FontAwesomeIcon name="refresh" color={Colors.TEXT_HEADER} size={24} />
                      <Text
                        style={{
                          color: Colors.TEXT_HEADER,
                        }}
                      >
                        Tap to refresh
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={{
                        paddingTop: 10,
                      }}
                    >
                      If new Board first create list and add card
                    </Text>
                  </View>
                )}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  marginVertical: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    // paddingVertical: 10,
                    height: 30,
                    backgroundColor: Colors.NAV_ICON,
                    borderWidth: 1,
                    borderColor: 'transparent',
                    paddingHorizontal: 25,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    if (selectedListTitle && cardtitle) {
                      this.createCards(cardtitle, selectedListTitle);
                      this.setAddCardVisible(!addCardVisible);
                      this.setState({
                        selectedListTitle: '',
                        cardtitle: '',
                      });
                    } else if (!selectedListTitle) {
                      Alert.alert('Choose List Name to add CARD');
                    } else if (!cardtitle) {
                      Alert.alert('Card title should not be empty');
                    }
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFF',
                      fontSize: 14,
                    }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    // paddingVertical: 10,
                    height: 30,
                    backgroundColor: Colors.NAV_ICON,
                    borderWidth: 1,
                    borderColor: 'transparent',
                    paddingHorizontal: 25,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    this.setAddCardVisible(!addCardVisible);
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFF',
                      fontSize: 14,
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </View>
    );
  };

  renderMoveCard = () => {
    const { moveCardVisible, enableScrollViewScroll, boardList, selectedListMove } = this.state;
    return (
      <View
        onStartShouldSetResponderCapture={() => {
          this.setState({ enableScrollViewScroll: true });
        }}
      >
        <Modal
          animationType="slide"
          transparent={true}
          visible={moveCardVisible}
          onRequestClose={() => {
            this.setMoveCardVisible(!moveCardVisible);
          }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
            scrollEnabled={enableScrollViewScroll}
            ref={(myScroll) => this._myScroll === myScroll}
          >
            <View
              style={{
                height: 300,
                width: 300,
                backgroundColor: '#FFF',
                flexDirection: 'column',
              }}
            >
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                  backgroundColor: '#F5F5F5',
                }}
              >
                <Text
                  style={{
                    color: Colors.NAV_ICON,
                    fontSize: 16,
                  }}
                >
                  Move Card
                </Text>
              </View>
              <View
                style={{
                  marginHorizontal: 5,
                  flex: 1,
                  borderRadius: 10,
                  marginVertical: 5,
                  borderWidth: 1,
                  borderColor: 'transparent',
                }}
                onStartShouldSetResponderCapture={() => {
                  this.setState({ enableScrollViewScroll: false });
                  if (enableScrollViewScroll === false) {
                    this.setState({ enableScrollViewScroll: true });
                  }
                }}
              >
                <FlatList
                  keyExtractor={(index) => index.toString()}
                  data={boardList}
                  onTouchStart={() => {
                    this.onEnableScroll(false);
                  }}
                  onMomentumScrollEnd={() => {
                    this.onEnableScroll(true);
                  }}
                  contentContainerStyle={{
                    flexGrow: 1,
                    backgroundColor: '#F5F5F5',
                  }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        height: 40,
                        backgroundColor: '#F5F5F5',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 10,
                      }}
                      key={item.key}
                      onPress={() => {
                        this.setState({
                          selectedListMove: item._id,
                        });
                      }}
                    >
                      <Text
                        style={{
                          color: selectedListMove === item._id ? '#2E88FF' : iOSColors.gray,
                          fontSize: 14,
                          paddingHorizontal: 20,
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  marginVertical: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    // paddingVertical: 10,
                    height: 30,
                    backgroundColor: Colors.NAV_ICON,
                    borderWidth: 1,
                    borderColor: 'transparent',
                    paddingHorizontal: 25,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    if (selectedListMove) {
                      this.moveCard(selectedListMove);
                      this.setMoveCardVisible(!moveCardVisible);
                      this.setState({
                        popUpCardNav: false,
                        cardListId: '',
                        cardCardId: '',
                        moveCardTitle: '',
                        selectedListMove: '',
                      });
                    } else {
                      Alert.alert('Choose List Name to move CARD');
                    }
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFF',
                      fontSize: 14,
                    }}
                  >
                    Move
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    // paddingVertical: 10,
                    height: 30,
                    backgroundColor: Colors.NAV_ICON,
                    borderWidth: 1,
                    borderColor: 'transparent',
                    paddingHorizontal: 25,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    this.setMoveCardVisible(!moveCardVisible);
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFF',
                      fontSize: 14,
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Modal>
        <TouchableOpacity
          style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
          onPress={() => {
            this.setMoveCardVisible(true);
          }}
        >
          <Icon name="file-move" type="material-community" color="#fff" size={23} />
        </TouchableOpacity>
      </View>
    );
  };

  renderFilterByList = () => {
    const { modalVisible, categoryList, selectedListName } = this.state;
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <View
            style={{
              height: 300,
              width: 300,
              backgroundColor: '#FFF',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
                backgroundColor: '#F5F5F5',
              }}
            >
              <Text
                style={{
                  color: '#000',
                  fontSize: 20,
                }}
              >
                Filter by list
              </Text>
            </View>
            <FlatList
              keyExtractor={(index) => index.toString()}
              data={categoryList}
              renderItem={(listItem) => (
                <TouchableOpacity
                  style={{
                    height: 40,
                    backgroundColor: '#FFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                  }}
                  key={listItem.index}
                  onPress={() => {
                    this.filteredList(listItem.item);
                    this.setModalVisible(!modalVisible);
                    this.setState({
                      filter: true,
                    });
                  }}
                >
                  <Text
                    style={{
                      color: selectedListName === listItem.item ? '#2E88FF' : iOSColors.gray,
                      fontSize: 18,
                      paddingHorizontal: 20,
                    }}
                    numberOfLines={1}
                  >
                    {listItem.item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                // paddingVertical: 10,
                borderTopWidth: 1,
                borderTopColor: '#dddddd',
              }}
              onPress={() => {
                this.setModalVisible(!modalVisible);
              }}
            >
              <Text
                style={{
                  color: '#FF5D5D',
                  fontSize: 20,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  renderCards = ({ item }) => {
    const { commentCount, checklistCount, cardCardId, popUpCardNav, popUpListNav } = this.state;
    const mem = item.members;
    return (
      <View style={{ flexDirection: 'column', marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => {
            if (!popUpCardNav && !popUpListNav) {
              this.fetchCardDetail(item);
            }
          }}
          onLongPress={() =>
            this.setState({
              popUpCardNav: Application.APPCONFIG.BOARD_EDIT_UPDATE,
              popUpListNav: false,
              updateListId: '',
              cardListId: item.listId,
              cardCardId: Application.APPCONFIG.BOARD_EDIT_UPDATE ? item._id : '',
              moveCardTitle: item.title,
            })
          }
          style={[
            styles.paddingHorizontal10,
            {
              backgroundColor: cardCardId === item._id ? '#2E88FF' : '#EEF5FF',
              borderRadius: 5,
              // marginBottom: 10,
              padding: 10,
              flexDirection: 'column',
              justifyContent: 'center',
            },
          ]}
        >
          <Text
            style={[
              styles.newsStatisticsText,
              { justifyContent: 'center', textAlign: 'left', color: '#000' },
            ]}
          >
            {item.title}
          </Text>
          {((commentCount ||
            checklistCount ||
            (mem !== '' && mem !== null && mem !== '[]') ||
            item.description) && (
            <View style={{ borderBottomWidth: 1, borderColor: '#D9E9FF', marginVertical: 8 }} />
          )) ||
            null}
          <View style={[styles.cMainIcon, { justifyContent: 'space-between' }]}>
            <View style={[styles.cMainIcon, { marginTop: 5 }]}>
              {commentCount && (
                <View style={styles.cIcon}>
                  <Icon
                    name="comment-text-outline"
                    type="material-community"
                    color={Colors.ICON_CARD}
                    size={13}
                  />
                  <Text style={styles.cText}>{commentCount}</Text>
                </View>
              )}
              {this.renderIcon(item.description)}
              {checklistCount && (
                <View style={styles.cIcon}>
                  <Icon
                    name="checkbox-marked-outline"
                    type="material-community"
                    color={Colors.ICON_CARD}
                    size={13}
                  />
                  <Text style={styles.cText}>{checklistCount}</Text>
                </View>
              )}
            </View>
            <View>{this.renderListAvatar(mem)}</View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderMembers(member) {
    if (member) {
      const memberObj = DBManager.user.findById(member);
      if (memberObj) {
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <Avatar avatarUrl={memberObj.avatarURL} avatarName={memberObj.name} avatarSize={30} />
            <View style={{ width: 5 }} />
          </View>
        );
      }
    }
  }

  renderRowAvatar = (rowData) => {
    const member = rowData;
    return <View>{this.renderMembers(member)}</View>;
  };

  renderListAvatar(mem) {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    if (mem !== '' && mem !== null && mem !== '[]') {
      const member = JSON.parse(mem);
      const members = dataSource.cloneWithRows(member);
      return (
        <ListView
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          renderRow={this.renderRowAvatar}
          dataSource={members}
          enableEmptySections={true}
          keyboardShouldPersistTaps="always"
        />
      );
    }
  }

  renderUpdateListTitle = () => {
    const { boardList, updateListTitle, updateListVisible, updateListId } = this.state;
    if (boardList) {
      const list = boardList.filter((lists) => lists.title === updateListId);
      return (
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={updateListVisible}
            onRequestClose={() => {
              this.setUpdateListVisible(!updateListVisible);
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
              }}
              onPress={() => {
                this.setUpdateListVisible(!updateListVisible);
              }}
            >
              <View
                style={{
                  height: 200,
                  width: 300,
                  backgroundColor: '#FFF',
                  flexDirection: 'column',
                }}
              >
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                    backgroundColor: '#F5F5F5',
                    marginTop: 0,
                  }}
                >
                  <Text
                    style={{
                      color: '#2E88FF',
                      fontSize: 20,
                    }}
                  >
                    Edit Title
                  </Text>
                </View>
                <TextInput
                  placeholder="Edit Title"
                  onChangeText={(text) =>
                    this.setState({
                      updateListTitle: text,
                    })
                  }
                  style={{
                    paddingHorizontal: 20,
                    margin: 1,
                    fontSize: 16,
                    borderWidth: 1,
                    borderRadius: 10,
                    borderColor: 'rgba(0,0,0,0.2)',
                    backgroundColor: 'rgba(0,0,0,0)',
                    color: '#222',
                    fontFamily: 'OpenSans-Regular',
                    marginVertical: 5,
                    marginHorizontal: 5,
                    height: 80,
                    textAlignVertical: 'top',
                  }}
                  multiline
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={updateListTitle}
                />
                <View
                  style={{
                    paddingHorizontal: 50,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#dddddd',
                      backgroundColor: Colors.NAV_ICON,
                      borderRadius: 20,
                      height: 40,
                      marginVertical: 10,
                    }}
                    onPress={() => {
                      if (updateListTitle) {
                        this.updateList(updateListTitle, list);
                        this.setUpdateListVisible(!updateListVisible);
                        this.setState({
                          popUpListNav: false,
                          updateListId: '',
                          updateListTitle: '',
                        });
                      } else {
                        Alert.alert('List title should not be empty');
                      }
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFF',
                        fontSize: 20,
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
          <TouchableOpacity
            style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
            onPress={() => {
              this.setUpdateListVisible(true);
            }}
          >
            <Icon name="square-edit-outline" size={23} color="#FFF" />
          </TouchableOpacity>
        </View>
      );
    }
  };

  renderBoards = () => {
    const { dataSource, updateListId, boardList } = this.state;
    const renderOutput = [];
    if (boardList.length > 0) {
      const sortedList = _.sortBy(boardList, 'sort');
      const filterByList = _.groupBy(sortedList, 'title');
      const listNames = Object.keys(filterByList);
      listNames.forEach((a) => {
        const filterList = _.filter(dataSource, { listTitle: a });
        if (filterList.length > 0) {
          const sortedCards = _.sortBy(filterList, 'sort');
          renderOutput.push(
            <View
              key={a}
              style={{
                marginBottom: 10,
              }}
            >
              <TouchableOpacity
                onLongPress={() => {
                  this.setState({
                    popUpListNav: Application.APPCONFIG.BOARD_EDIT_UPDATE,
                    popUpCardNav: false,
                    cardCardId: '',
                    updateListTitle: a,
                    updateListId: Application.APPCONFIG.BOARD_EDIT_UPDATE ? a : '',
                  });
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    marginBottom: 10,
                    textAlign: 'left',
                    fontWeight: '500',
                    color: updateListId === a ? Colors.NAV_ICON : Colors.TEXT_BLACK,
                  }}
                >
                  {a}
                </Text>
              </TouchableOpacity>
              <FlatList
                keyExtractor={this.keyExtractor}
                data={sortedCards}
                renderItem={this.renderCards}
                scrollEnabled={false}
              />
            </View>,
          );
        }
      });
      return renderOutput;
    }
  };

  renderLabel = ({ route }) => {
    const { updateListId } = this.state;
    return (
      <TouchableOpacity
        // onLongPress={() => {
        //   this.setState({
        //     popUpListNav: Application.APPCONFIG.BOARD_EDIT_UPDATE,
        //     popUpCardNav: false,
        //     cardCardId: '',
        //     updateListTitle: route.title,
        //     updateListId: Application.APPCONFIG.BOARD_EDIT_UPDATE ? route.title : '',
        //   });
        // }}
        style={{ flex: 1, paddingVertical: 5 }}
      >
        <Text
          style={{
            fontSize: 16,
            color: updateListId === route.title ? Colors.NAV_ICON : '#2E88FF',
            fontWeight: '200',
          }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {route.title}
        </Text>
      </TouchableOpacity>
    );
  };

  renderTabBar = (props) => (
    <TabBar
      {...props}
      scrollEnabled
      renderLabel={this.renderLabel}
      indicatorStyle={{ backgroundColor: '#2E88FF' }}
      style={{
        backgroundColor: '#fff',
      }}
    />
  );

  renderScene = ({ route }) => {
    const {
      tabListCard,
      commentCount,
      checklistCount,
      popUpCardNav,
      popUpListNav,
      cardCardId,
    } = this.state;
    switch (route.key) {
      default:
        if (tabListCard) {
          const data = tabListCard.filter((card) => card.listTitle === route.key);
          if (data) {
            return (
              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: 10,
                  paddingTop: 10,
                }}
              >
                <FlatList
                  data={data}
                  keyExtractor={(item, index) => index.toString()}
                  key={tabListCard._id}
                  renderItem={({ item }) => {
                    const mem = item.members;
                    return (
                      <View style={{ flexDirection: 'column', marginBottom: 10 }}>
                        <TouchableOpacity
                          onPress={() => {
                            if (!popUpCardNav && !popUpListNav) {
                              this.fetchCardDetail(item);
                            }
                          }}
                          onLongPress={() =>
                            this.setState({
                              popUpCardNav: Application.APPCONFIG.BOARD_EDIT_UPDATE,
                              popUpListNav: false,
                              updateListId: '',
                              cardListId: item.listId,
                              cardCardId: Application.APPCONFIG.BOARD_EDIT_UPDATE ? item._id : '',
                              moveCardTitle: item.title,
                            })
                          }
                          style={[
                            styles.paddingHorizontal10,
                            {
                              backgroundColor: cardCardId === item._id ? '#2E88FF' : '#EEF5FF',
                              borderRadius: 5,
                              padding: 10,
                              flexDirection: 'column',
                              justifyContent: 'center',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.newsStatisticsText,
                              { justifyContent: 'center', textAlign: 'left', color: '#000' },
                            ]}
                          >
                            {item.title}
                          </Text>
                          {((commentCount ||
                            checklistCount ||
                            (mem !== '' && mem !== null && mem !== '[]') ||
                            item.description) && (
                            <View
                              style={{
                                borderBottomWidth: 1,
                                borderColor: '#D9E9FF',
                                marginVertical: 8,
                              }}
                            />
                          )) ||
                            null}
                          <View style={[styles.cMainIcon, { justifyContent: 'space-between' }]}>
                            <View style={[styles.cMainIcon, { marginTop: 5 }]}>
                              {commentCount && (
                                <View style={styles.cIcon}>
                                  <Icon
                                    name="comment-text-outline"
                                    type="material-community"
                                    color={Colors.ICON_CARD}
                                    size={13}
                                  />
                                  <Text style={styles.cText}>{commentCount}</Text>
                                </View>
                              )}
                              {this.renderIcon(item.description)}
                              {checklistCount && (
                                <View style={styles.cIcon}>
                                  <Icon
                                    name="checkbox-marked-outline"
                                    type="material-community"
                                    color={Colors.ICON_CARD}
                                    size={13}
                                  />
                                  <Text style={styles.cText}>{checklistCount}</Text>
                                </View>
                              )}
                            </View>
                            <View>{this.renderListAvatar(mem)}</View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              </ScrollView>
            );
          }
        }
    }
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.heading}>No Cards yet...</Text>
      </View>
    );
  };

  renderMain = () => {
    const { board, dataSource, filter, cardtitle, toggleView, firstListId } = this.state;
    const { boardName } = this.props;
    if (board.title === boardName) {
      return (
        <View style={{ flex: 1 }}>
          {(!toggleView && (
            <ScrollView
              contentContainerStyle={{ padding: 15, backgroundColor: '#FFF' }}
              containerStyle={[styles.flex1, styles.disclaimerContainer]}
            >
              {!filter ? this.renderBoards() : this.renderFilterList()}
            </ScrollView>
          )) || (
            <TabView
              navigationState={this.state}
              renderTabBar={this.renderTabBar}
              renderScene={this.renderScene}
              onIndexChange={(index) => {
                this.setState({ index });
                this.sortGroupListByName(index);
              }}
              initialLayout={{ width: Dimensions.get('window').width, height: 0 }}
            />
          )}
          {dataSource.length > 0 && (
            <View style={[styles.rowDirection, styles.imagePreviewMessagecontainer]}>
              <TextInput
                style={[styles.flex1, styles.imagePreviewTextInput]}
                placeholder="Add card to first list"
                autoCapitalize="sentences"
                onChangeText={(text) => this.setState({ cardtitle: text })}
                value={cardtitle}
                multiline
                underlineColorAndroid="transparent"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.alignJustifyCenter, styles.imagePreviewSendButton]}
                onPress={() => {
                  Keyboard.dismiss();
                  this.createCards(cardtitle, firstListId);
                  this.setState({
                    cardtitle: '',
                    firstListId: '',
                    index: 0,
                  });
                }}
              >
                <Icon name="send" size={20} color={Colors.ICON_WHITE} />
              </TouchableOpacity>
            </View>
          )}
          {Application.APPCONFIG.BOARD_EDIT_UPDATE && this.renderAddList()}
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.heading}>No cards yet...</Text>
      </View>
    );
  };

  renderFilterList = () => {
    const { boardsOfCards, listWithFilter } = this.state;
    if (boardsOfCards.length > 0) {
      return (
        <ScrollView
          style={{ padding: 15 }}
          containerStyle={[styles.flex1, styles.disclaimerContainer]}
        >
          <FlatList
            keyExtractor={this.keyExtractor}
            data={listWithFilter}
            renderItem={this.renderCards}
            scrollEnabled={false}
          />
        </ScrollView>
      );
    }
  };

  render() {
    const { boardName } = this.props;
    const { popUpCardNav, popUpListNav, toggleView, index } = this.state;
    return (
      <Screen>
        {!popUpCardNav &&
          !popUpListNav && (
            <NavBar
              titleText={boardName}
              titleContainer={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingLeft: 40,
              }}
              leftComponent={
                <TouchableOpacity
                  style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                  onPress={() => {
                    if (Actions.currentScene === 'GroupTasksListScene') {
                      Actions.pop();
                    }
                  }}
                >
                  <Icon
                    name="chevron-left"
                    type="material-community"
                    color={Colors.NAV_ICON}
                    size={36}
                  />
                </TouchableOpacity>
              }
              rightComponent={
                <View style={[styles.rowDirection, styles.paddingRight10]}>
                  <TouchableOpacity
                    style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                    onPress={() => {
                      this.fetchBoardTasks();
                      this.fetchBoard();
                    }}
                  >
                    <EvilIcon
                      name="refresh"
                      type="material-community"
                      color={Colors.NAV_ICON}
                      size={38}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                    onPress={() => {
                      this.setState({
                        toggleView: !toggleView,
                      });
                      this.sortGroupListByName(index);
                    }}
                  >
                    {(!toggleView && (
                      <FontAwesomeIcon
                        name="toggle-off"
                        outline
                        color={Colors.NAV_ICON}
                        size={28}
                      />
                    )) || <FontAwesomeIcon name="toggle-on" color={Colors.NAV_ICON} size={28} />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                    onPress={() => {
                      this.setAddListVisible(true);
                    }}
                  >
                    <AntDesignIcon name="addfile" color={Colors.NAV_ICON} size={20} />
                  </TouchableOpacity>
                  {/* <TouchableOpacity style={{ marginRight: 15 }} onPress={() => {
              this.setModalVisible(true);
            }}>
            <Icon name="filter-outline" type="material-community" color={Colors.NAV_ICON} size={30} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginRight: 15 }} onPress={() => {
              this.setState({ filter: false })
            }}>
            <Icon name="filter-remove-outline" type="material-community" color={Colors.NAV_ICON} size={30} />
          </TouchableOpacity> */}
                </View>
              }
            />
          )}
        {(popUpCardNav && (
          <NavBar
            navContainerStyle={{ backgroundColor: 'rgba(46, 136, 255, 1)' }}
            leftComponent={
              <TouchableOpacity
                style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                onPress={() => {
                  this.setState({
                    popUpCardNav: false,
                    cardListId: '',
                    cardCardId: '',
                    moveCardTitle: '',
                  });
                }}
              >
                <Icon name="chevron-left" type="material-community" color="#FFF" size={36} />
              </TouchableOpacity>
            }
            rightComponent={
              <View style={[styles.rowDirection, styles.paddingRight10]}>
                {this.renderMoveCard()}
                <TouchableOpacity
                  style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                  onPress={() => {
                    Alert.alert(
                      'Delete',
                      'Do you want to delete Card?',
                      [
                        { text: 'No', onPress: () => {}, style: 'cancel' },
                        {
                          text: 'Yes',
                          onPress: () => {
                            this.deleteCard();
                            this.setState({
                              popUpCardNav: false,
                              cardListId: '',
                              cardCardId: '',
                              moveCardTitle: '',
                            });
                          },
                        },
                      ],
                      { cancelable: false },
                    );
                  }}
                >
                  <FontAwesomeIcon
                    name="trash-o"
                    type="material-community"
                    color="#FFF"
                    size={22}
                  />
                </TouchableOpacity>
              </View>
            }
          />
        )) ||
          null}
        {(popUpListNav && (
          <NavBar
            navContainerStyle={{ backgroundColor: 'rgba(46, 136, 255, 1)' }}
            leftComponent={
              <TouchableOpacity
                style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                onPress={() => {
                  this.setState({
                    popUpListNav: false,
                    updateListId: '',
                  });
                }}
              >
                <Icon name="chevron-left" type="material-community" color="#FFF" size={36} />
              </TouchableOpacity>
            }
            rightComponent={
              <View style={[styles.rowDirection, styles.paddingRight10]}>
                {this.renderUpdateListTitle()}
                <TouchableOpacity
                  style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                  onPress={() => {
                    Alert.alert(
                      'Delete',
                      'Do you want to delete List?',
                      [
                        { text: 'No', onPress: () => {}, style: 'cancel' },
                        {
                          text: 'Yes',
                          onPress: () => {
                            this.deleteList();
                            this.setState({
                              popUpListNav: false,
                              updateListId: '',
                            });
                          },
                        },
                      ],
                      { cancelable: false },
                    );
                  }}
                >
                  <FontAwesomeIcon
                    name="trash-o"
                    type="material-community"
                    color="#FFF"
                    size={22}
                  />
                </TouchableOpacity>
              </View>
            }
          />
        )) ||
          null}
        {this.renderMain()}
        {this.renderFilterByList()}
        {/* {Application.APPCONFIG.BOARD_EDIT_UPDATE && this.renderAddCard()} */}
      </Screen>
    );
  }
}

GroupTask.propTypes = {
  boardName: PropTypes.string,
  groupId: PropTypes.string,
};

GroupTask.defaultProps = {
  boardName: '',
  groupId: '',
};
