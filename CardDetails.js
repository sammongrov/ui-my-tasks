import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  ListView,
  FlatList,
  Modal,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import { iOSColors } from 'react-native-typography';
import PropTypes from 'prop-types';
import { styles } from 'react-native-theme';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import Swipeout from 'react-native-swipeout';
// import { Icon } from 'react-native-elements';
import { Colors } from '@ui/theme_default';
import {
  NavBar,
  Text,
  Screen,
  Icon,
  Avatar,
  TextInput,
  FontAwesomeIcon,
  MaterialIcon,
  EvilIcon,
} from '@ui/components';
// import DBManager from '../app/DBManager';
import {DBManager} from 'app-module';
import AppUtil from '@mongrov/utils'; 
import {Application} from '@mongrov/config';

export default class CardDetails extends Component {
  static propTypes = {
    cardId: PropTypes.string.isRequired,
  };

  static defaultProps = {};

  state = {
    tapComment: '',
    updateCardVisible: false,
    addDescriptionVisible: false,
    addChecklistVisible: false,
    updateCheckListVisible: false,
    updateCheckListItemVisible: false,
    addItemVisible: false,
    updateMemberVisible: false,
    enableScrollViewScroll: true,
    cardTitle: '',
    descriptionTitle: '',
    checklistTitle: '',
    itemTitle: '',
    checkList: '',
    addItemID: '',
    checkListValue: '',
    checkListID: '',
    checkListItemValue: '',
    itemCheckListID: '',
    checklistItemID: '',
    checkListItems: {},
    commentText: '',
    rowIndex: '',
    commentIndex: '',
    popUpListNav: false,
    checklistUpdateIos: '',
    pushOrPopMember: [],
  };

  componentWillMount() {
    const { cardId, boardId } = this.props;
    const fetchChecklist = {
      boardID: boardId,
      cardID: cardId,
    };
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    DBManager.checklists.fetchCheckListTask(fetchChecklist);
    DBManager.cardComments.fetchComment(fetchChecklist);
  }

  componentWillUnmount = () => {
    const { cardId } = this.props;
    this._isMounted = false;
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    DBManager.card.removeCardDetailListner(cardId, this.updateBoardList);
    DBManager.checklists.removeCheckListListner(cardId, this.updateCheckList);
    DBManager.checklists.removeCheckListItemListner(this.updateCheckListItem);
    DBManager.cardComments.removeCommentsListner(cardId, this.updateComments);
  };

  componentDidMount = () => {
    const { cardId } = this.props;
    this._isMounted = true;
    DBManager.card.addCardDetailListner(cardId, this.updateBoardList);
    DBManager.checklists.addCheckListListner(cardId, this.updateCheckList);
    DBManager.checklists.addCheckListItemListner(this.updateCheckListItem);
    DBManager.cardComments.addCommentsListner(cardId, this.updateComments);
    this.fetchGroupMembers();
  };

  setUpdateCardVisible(visible) {
    this.setState({ updateCardVisible: visible });
  }

  setAddDescriptionVisible(visible) {
    this.setState({ addDescriptionVisible: visible });
  }

  setAddChecklistVisible(visible) {
    this.setState({ addChecklistVisible: visible });
  }

  setUpdateCheckListVisible(visible) {
    this.setState({ updateCheckListVisible: visible });
  }

  setUpdateCheckListItemVisible(visible) {
    this.setState({ updateCheckListItemVisible: visible });
  }

  setAddItemVisible(visible) {
    this.setState({ addItemVisible: visible });
  }

  setUpdateMemberVisible(visible) {
    this.setState({ updateMemberVisible: visible });
  }

  handleBackPress = () => {
    Actions.pop();
    return true;
  };

  onEnableScroll = (value) => {
    this.setState({
      enableScrollViewScroll: value,
    });
  };

  keyExtractor = (item) => item._id;

  updateBoardList = (response) => {
    if (this._isMounted) {
      const resp = response['0'];
      this.setState({
        cardItemDetail: resp,
      });
    }
  };

  updateCheckList = () => {
    if (!this._isMounted) return;
    const { cardId } = this.props;
    const checkLists = DBManager.checklists.findByCardIdAsList(cardId);
    this.checkLists = checkLists;
    if (checkLists) {
      this.setState({
        checkList: checkLists,
      });
    }
  };

  updateCheckListItem = async () => {
    if (!this._isMounted) return;
    const { cardId } = this.props;
    const checkListItems = DBManager.checklists.findCheckListItemByCardId(cardId);
    if (checkListItems) {
      this.setState({
        checkListItem: checkListItems,
      });
    }
  };

  updateComments = async () => {
    if (!this._isMounted) return;
    const { cardId } = this.props;
    const comments = DBManager.cardComments.findByCardIdAsList(cardId);
    if (comments) {
      const updateCommentList = Object.keys(comments).map((key) => comments[key]);
      const Comments = _.orderBy(updateCommentList, 'createdAt', 'desc');
      this.comments = Comments;
      // this.setState({checkLists})
      this.setState({
        updateComments: Comments,
      });
    }
  };

  fetchGroupMembers = async () => {
    const { groupID } = this.props;
    const groupMembers = await DBManager._taskManager.chat.getGroupUsers(groupID);
    if (this._isMounted) {
      this.setState({
        boardMembers: groupMembers,
      });
    }
  };

  fetchCardTasks = () => {
    const { boardName } = this.props;
    DBManager.board.fetchBoardTasks(boardName);
  };

  fetchChecklistTasks = () => {
    const { cardId, boardId } = this.props;
    const fetchChecklist = {
      boardID: boardId,
      cardID: cardId,
    };
    DBManager.checklists.fetchCheckListTask(fetchChecklist);
  };

  fetchCommentTasks = () => {
    const { cardId, boardId } = this.props;
    const fetchComments = {
      boardID: boardId,
      cardID: cardId,
    };
    DBManager.cardComments.fetchComment(fetchComments);
  };

  updateSize = (height) => {
    this.setState({
      height,
    });
  };

  updateCardTitle = (cardTitle) => {
    const { cardItemDetail } = this.state;
    const { board } = DBManager._taskManager;
    const updateCardTitle = {
      title: cardTitle,
      cardId: cardItemDetail._id,
      authorId: cardItemDetail.userId,
      listId: cardItemDetail.listId,
      boardId: cardItemDetail.boardId,
    };
    if (updateCardTitle) {
      board.updateCard(updateCardTitle);
      setTimeout(() => {
        this.fetchCardTasks();
      }, 1000);
    }
  };

  createAndUpdateDescription = (descriptionTitle) => {
    const { cardItemDetail } = this.state;
    const { board } = DBManager._taskManager;
    const addDescription = {
      title: cardItemDetail.title,
      description: descriptionTitle,
      cardId: cardItemDetail._id,
      authorId: cardItemDetail.userId,
      listId: cardItemDetail.listId,
      boardId: cardItemDetail.boardId,
    };
    if (addDescription) {
      board.updateCard(addDescription);
      setTimeout(() => {
        this.fetchCardTasks();
      }, 1000);
    }
  };

  updateEditedCheckList = (checkListTitle, checkListID) => {
    const { cardItemDetail } = this.state;
    const { board } = DBManager._taskManager;
    const updateEditedCheckListTitle = {
      cardId: cardItemDetail._id,
      checklistId: checkListID,
      boardId: cardItemDetail.boardId,
      title: checkListTitle,
    };
    if (updateEditedCheckListTitle) {
      board.updateChecklist(updateEditedCheckListTitle);
      this.fetchChecklistTasks();
    }
  };

  updateEditedCheckListItem = (checkListItemTitle, itemCheckListID, checklistItemID) => {
    const { cardItemDetail } = this.state;
    const { board } = DBManager._taskManager;
    const updateEditedCheckListItemTitle = {
      title: checkListItemTitle,
      cardId: cardItemDetail._id,
      checklistId: itemCheckListID,
      itemId: checklistItemID,
      boardId: cardItemDetail.boardId,
    };
    if (updateEditedCheckListItemTitle) {
      board.updateChecklistItem(updateEditedCheckListItemTitle);
      this.fetchChecklistTasks();
    }
  };

  updateCardMember = (pushOrPopMember) => {
    const { cardItemDetail } = this.state;
    const { board } = DBManager._taskManager;
    const updateCardMembers = {
      title: cardItemDetail.title,
      cardId: cardItemDetail._id,
      authorId: cardItemDetail.userId,
      listId: cardItemDetail.listId,
      boardId: cardItemDetail.boardId,
      members: pushOrPopMember,
    };
    if (updateCardMembers) {
      board.updateCard(updateCardMembers);
      setTimeout(() => {
        this.fetchCardTasks();
      }, 1000);
    }
  };

  updateItemFinish = (itemfinish, itemChecklistId, itemID) => {
    const { cardItemDetail } = this.state;
    const { board } = DBManager._taskManager;
    if (itemfinish) {
      const isFinished = {
        isFinished: false,
        boardId: cardItemDetail.boardId,
        cardId: cardItemDetail._id,
        checklistId: itemChecklistId,
        itemId: itemID,
      };
      if (isFinished) {
        board.updateChecklistItem(isFinished);
        this.fetchChecklistTasks();
      }
    } else {
      const isFinished = {
        isFinished: true,
        boardId: cardItemDetail.boardId,
        cardId: cardItemDetail._id,
        checklistId: itemChecklistId,
        itemId: itemID,
      };
      if (isFinished) {
        board.updateChecklistItem(isFinished);
        this.fetchChecklistTasks();
      }
    }
  };

  addChecklist = (checklistTitle) => {
    const { cardItemDetail } = this.state;
    const { board } = DBManager._taskManager;
    const checklistToSave = {
      title: checklistTitle,
      boardId: cardItemDetail.boardId,
      cardId: cardItemDetail._id,
      authorId: DBManager.app.userId,
    };
    if (checklistToSave) {
      board.createChecklist(checklistToSave);
      this.fetchChecklistTasks();
    }
  };

  addItem = (itemTitle) => {
    const { cardItemDetail, addItemID } = this.state;
    const { board } = DBManager._taskManager;
    const itemToSave = {
      title: itemTitle,
      boardId: cardItemDetail.boardId,
      cardId: cardItemDetail._id,
      checklistId: addItemID,
      authorId: DBManager.app.userId,
    };
    if (itemToSave) {
      board.createChecklistItem(itemToSave);
      this.setState({
        addItemID: '',
      });
      this.fetchChecklistTasks();
    }
  };

  addComments = (commentText) => {
    const { cardItemDetail } = this.state;
    const { board } = DBManager._taskManager;
    const commentToSave = {
      title: commentText,
      boardId: cardItemDetail.boardId,
      cardId: cardItemDetail._id,
      userId: DBManager.app.userId,
    };
    if (commentToSave) {
      board.createComment(commentToSave);
      this.fetchCommentTasks();
      Keyboard.dismiss();
    }
  };

  deleteChecklist = (item) => {
    const { boardId } = this.props;
    const BoardID = boardId;
    const { board } = DBManager._taskManager;
    const deleteChecklist = {
      boardId: BoardID,
      cardId: item.cardId,
      checklistId: item._id,
    };
    if (deleteChecklist) {
      board.deleteChecklist(deleteChecklist);
      this.fetchChecklistTasks();
    }
  };

  deleteChecklistItem = (item) => {
    const { checklistUpdateIos } = this.state;
    const { boardId } = this.props;
    const { board } = DBManager._taskManager;
    if (checklistUpdateIos) {
      const BoardID = boardId;
      const deleteChecklistItem = {
        boardId: BoardID,
        cardId: checklistUpdateIos.cardId,
        checklistId: checklistUpdateIos.checklistId,
        itemId: checklistUpdateIos._id,
      };
      if (deleteChecklistItem) {
        board.deleteChecklistItem(deleteChecklistItem);
        this.fetchChecklistTasks();
      }
    } else {
      const BoardID = boardId;
      const deleteChecklistItem = {
        boardId: BoardID,
        cardId: item.cardId,
        checklistId: item.checklistId,
        itemId: item._id,
      };
      if (deleteChecklistItem) {
        board.deleteChecklistItem(deleteChecklistItem);
        this.fetchChecklistTasks();
      }
    }
  };

  deleteComment = (comment) => {
    const { board } = DBManager._taskManager;
    const commentToDelete = {
      boardId: comment.boardId,
      cardId: comment.cardId,
      commentId: comment._id,
    };
    if (commentToDelete) {
      board.deleteComment(commentToDelete);
      this.fetchCommentTasks();
    }
  };

  avatarComment(avatar) {
    // const avatar = DBManager.user.findById(id) || {};
    if (avatar.avatarURL && this._isMounted) {
      return (
        <Avatar
          statusColor="transparent"
          avatarUrl={avatar.avatarURL}
          avatarName={avatar.name}
          key={avatar.avatarURL}
          avatarSize={30}
        />
      );
    }
  }

  renderListcomment() {
    const { boardId, cardId } = this.props;
    const { updateComments } = this.state;
    if (!updateComments) return null;
    const commentsCount = updateComments.length;
    const limitedComments = _.slice(updateComments, 0, 3);
    return (
      <View
        style={{
          flex: 1,
          marginTop: 10,
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#EEF5FF',
            borderRadius: 10,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              textAlign: 'left',
              color: '#2E88FF',
              paddingHorizontal: 10,
            }}
          >
            Comments
          </Text>
          <FlatList
            renderItem={this.renderRowcomment}
            keyExtractor={(items) => items._id}
            data={limitedComments}
            scrollEnabled={false}
          />
          {commentsCount > 3 && (
            <TouchableOpacity
              style={{ alignItems: 'flex-end', marginTop: 5 }}
              onPress={() => {
                if (Actions.currentScene === 'GroupCardDetailsScene') {
                  Actions.GroupCommentDetails({
                    commentBoardId: boardId,
                    commentCardId: cardId,
                  });
                }
                if (Actions.currentScene === 'CardDetails') {
                  Actions.CommentsList({
                    commentBoardId: boardId,
                    commentCardId: cardId,
                  });
                }
              }}
            >
              <Text style={{ color: '#2E88FF', fontSize: 14, paddingRight: 10 }}>
                View all {commentsCount} comments
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  renderRowcomment = ({ item }) => {
    const { tapComment, commentIndex } = this.state;
    const id = item.userId;
    const user = DBManager.user.findById(id) || {};
    // const swipeBtns = [
    //   {
    //     component: (
    //       <View
    //         style={{
    //           flex: 1,
    //           alignItems: 'center',
    //           justifyContent: 'center',
    //         }}
    //       >
    //         <FontAwesomeIcon name="trash-o" type="material-community" color="#2E88FF" size={20} />
    //       </View>
    //     ),
    //     backgroundColor: '#FFF',
    //     underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
    //     onPress: () => {
    //       Alert.alert(
    //         'Delete',
    //         'Do you want to delete Comment ?',
    //         [
    //           { text: 'No', onPress: () => {}, style: 'cancel' },
    //           {
    //             text: 'Yes',
    //             onPress: () => {
    //               this.deleteComment(item);
    //               this.fetchCommentTasks();
    //             },
    //           },
    //         ],
    //         { cancelable: false },
    //       );
    //     },
    //   },
    // ];
    return (
      // <Swipeout
      //   right={swipeBtns}
      //   autoClose={true}
      //   backgroundColor="transparent"
      //   buttonWidth={40}
      //   onOpen={() => {
      //     this.setState({
      //       commentIndex: item._id,
      //     });
      //   }}
      //   close={commentIndex !== item._id}
      //   onClose={() => {
      //     if (item._id === commentIndex) {
      //       this.setState({ commentIndex: '' });
      //     }
      //   }}
      // >
      <TouchableOpacity
        style={[
          styles.rowDirection,
          {
            paddingLeft: 10,
            backgroundColor: commentIndex === item._id ? '#E0EDFF' : '#EEF5FF',
          },
        ]}
        onPress={() => {
          this.setState({
            tapComment: item._id,
          });
        }}
      >
        <View style={{ paddingTop: 7 }}>{this.avatarComment(user)}</View>
        <View style={[styles.cListRowContainer]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <View>
              <Text numberOfLines={1} style={styles.cListTitle}>
                {user.username}
              </Text>
            </View>
            <View>
              <Text
                numberOfLines={1}
                style={[
                  styles.fontSize12,
                  { color: Colors.TYP_GRAY },
                  { marginBottom: 5, paddingRight: 10 },
                ]}
              >
                {AppUtil.formatDate(item.createdAt).toString()}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ flexDirection: 'column', flex: 1, marginRight: 5 }}>
              <Text
                numberOfLines={tapComment !== item._id ? 2 : null}
                ellipsizeMode="tail"
                style={[styles.flex1, styles.cListLastMessage, { color: Colors.TYP_GRAY }]}
              >
                {item.text}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      // </Swipeout>
    );
  };

  renderCheckList = ({ item }) => (
    <View
      style={{
        borderBottomWidth: 1,
        borderColor: '#D9E9FF',
      }}
    >
      <View
        style={{
          paddingHorizontal: 5,
          paddingVertical: 10,
          paddingLeft: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          style={{
            marginRight: 8,
          }}
          onPress={() => {
            this.setUpdateCheckListVisible(true);
            this.setState({
              checkListValue: item.title,
              checkListID: item._id,
              checkListItems: item,
            });
          }}
        >
          <Text style={{ color: '#353638', fontSize: 16 }}>{item.title}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            borderRadius: 50,
            backgroundColor: '#FFF',
          }}
          onPress={() => {
            this.setAddItemVisible(true);
            this.setState({
              addItemID: item._id,
            });
          }}
        >
          <MaterialIcon name="add" size={22} color="#2E88FF" style={{ padding: 3 }} />
        </TouchableOpacity>
      </View>
      {this.renderChecklistItem(item._id)}
    </View>
  );

  renderList = () => {
    const { checkList } = this.state;
    if (!checkList) return null;
    const updateCheck = Object.keys(checkList).map((key) => checkList[key]);
    return (
      <View>
        <View
          style={{
            marginTop: 8,
            borderBottomWidth: 1,
            borderColor: '#D9E9FF',
          }}
        />
        <FlatList
          renderItem={this.renderCheckList}
          keyExtractor={(items) => items._id}
          data={updateCheck}
          scrollEnabled={false}
        />
      </View>
    );
  };

  renderChecklistItemView = ({ item }) => {
    const { rowIndex, checklistItemID } = this.state;
    const swipeBtns = [
      {
        component: (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="square-edit-outline" size={20} color="#2E88FF" />
          </View>
        ),
        backgroundColor: '#FFF',
        underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
        onPress: () => {
          this.setUpdateCheckListItemVisible(true);
          this.setState({
            checkListItemValue: item.title,
            itemCheckListID: item.checklistId,
            checklistItemID: item._id,
          });
        },
      },
      {
        component: (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesomeIcon name="trash-o" type="material-community" color="#2E88FF" size={20} />
          </View>
        ),
        backgroundColor: '#FFF',
        underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
        onPress: () => {
          Alert.alert(
            'Delete',
            'Do you want to delete ChecklistItem ?',
            [
              { text: 'No', onPress: () => {}, style: 'cancel' },
              {
                text: 'Yes',
                onPress: () => {
                  this.deleteChecklistItem(item);
                  this.fetchChecklistTasks();
                },
              },
            ],
            { cancelable: false },
          );
        },
      },
    ];
    return (
      <View>
        {(Platform.OS !== 'ios' && (
          <Swipeout
            right={swipeBtns}
            autoClose={true}
            backgroundColor="transparent"
            buttonWidth={40}
            onOpen={() => {
              this.setState({
                rowIndex: item._id,
              });
            }}
            close={rowIndex !== item._id}
            onClose={() => {
              if (item._id === rowIndex) {
                this.setState({ rowIndex: '' });
              }
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                paddingVertical: 15,
                paddingHorizontal: 5,
                backgroundColor: rowIndex === item._id ? '#E0EDFF' : '#EEF5FF',
              }}
              onPress={() => {
                this.updateItemFinish(item.isFinished, item.checklistId, item._id);
                this.fetchChecklistTasks();
              }}
            >
              <View>
                {item.isFinished && (
                  <Icon name="checkbox-marked-outline" size={18} color={Colors.NAV_ICON} />
                )}

                {!item.isFinished && (
                  <Icon name="checkbox-blank-outline" size={18} color={Colors.NAV_ICON} />
                )}
              </View>
              <View
                style={{
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '400',
                    paddingLeft: 10,
                  }}
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          </Swipeout>
        )) || (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              paddingVertical: 15,
              paddingHorizontal: 5,
              backgroundColor: checklistItemID === item._id ? '#E0EDFF' : '#EEF5FF',
            }}
            onPress={() => {
              this.updateItemFinish(item.isFinished, item.checklistId, item._id);
              this.fetchChecklistTasks();
            }}
            onLongPress={() =>
              this.setState({
                popUpListNav: Application.APPCONFIG.BOARD_EDIT_UPDATE,
                checklistUpdateIos: item,
                checkListItemValue: item.title,
                itemCheckListID: item.checklistId,
                checklistItemID: item._id,
              })
            }
          >
            <View>
              {item.isFinished && (
                <Icon name="checkbox-marked-outline" size={18} color={Colors.NAV_ICON} />
              )}

              {!item.isFinished && (
                <Icon name="checkbox-blank-outline" size={18} color={Colors.NAV_ICON} />
              )}
            </View>
            <View
              style={{
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  paddingLeft: 10,
                }}
              >
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  renderChecklistItem = (checkListId) => {
    const { checkListItem } = this.state;
    if (!checkListItem) return null;
    const details = checkListItem.filter((Item) => Item.checklistId === checkListId);
    return (
      <View style={{ paddingLeft: 5 }}>
        <FlatList
          data={details}
          keyExtractor={(item, index) => index.toString()}
          renderItem={this.renderChecklistItemView}
        />
      </View>
    );
  };

  renderMembers(member) {
    if (member) {
      const memberObj = DBManager.user.findById(member);
      if (memberObj) {
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <Avatar avatarUrl={memberObj.avatarURL} avatarName={memberObj.name} avatarSize={28} />
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

  renderAddChecklist = () => {
    const { addChecklistVisible, checklistTitle } = this.state;
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={addChecklistVisible}
          onRequestClose={() => {
            this.setAddChecklistVisible(!addChecklistVisible);
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
              this.setAddChecklistVisible(!addChecklistVisible);
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
                  Add Checklist
                </Text>
              </View>
              <TextInput
                placeholder="New List Title"
                onChangeText={(text) => this.setState({ checklistTitle: text })}
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
                    if (checklistTitle) {
                      this.addChecklist(checklistTitle);
                      this.setAddChecklistVisible(!addChecklistVisible);
                      this.fetchChecklistTasks();
                      this.setState({
                        checklistTitle: '',
                      });
                    } else {
                      Alert.alert('Checklist title should not be empty');
                    }
                  }}
                >
                  <Text
                    style={{
                      color: '#FFF',
                      fontSize: 20,
                    }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  renderAddItems = () => {
    const { addItemVisible, itemTitle } = this.state;
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={addItemVisible}
          onRequestClose={() => {
            this.setAddItemVisible(!addItemVisible);
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
              this.setAddItemVisible(!addItemVisible);
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
                  Add Checklist Item
                </Text>
              </View>
              <TextInput
                placeholder="New List Title"
                onChangeText={(text) => this.setState({ itemTitle: text })}
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
                    if (itemTitle) {
                      this.addItem(itemTitle);
                      this.setAddItemVisible(!addItemVisible);
                      this.fetchChecklistTasks();
                      this.setState({
                        itemTitle: '',
                      });
                    } else {
                      Alert.alert('Checklist Item title should not be empty');
                    }
                  }}
                >
                  <Text
                    style={{
                      color: '#FFF',
                      fontSize: 20,
                    }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  renderUpdateCardTitle = () => {
    const { updateCardVisible, cardTitle } = this.state;
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={updateCardVisible}
          onRequestClose={() => {
            this.setUpdateCardVisible(!updateCardVisible);
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
              this.setUpdateCardVisible(!updateCardVisible);
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
                    cardTitle: text,
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
                value={cardTitle}
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
                    if (cardTitle) {
                      this.updateCardTitle(cardTitle);
                      this.setUpdateCardVisible(!updateCardVisible);
                      this.fetchCardTasks();
                    } else {
                      Alert.alert('Card title should not be empty');
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
      </View>
    );
  };

  renderUpdateChecklist = () => {
    const { updateCheckListVisible, checkListValue, checkListID, checkListItems } = this.state;
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={updateCheckListVisible}
          onRequestClose={() => {
            this.setUpdateCheckListVisible(!updateCheckListVisible);
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
              this.setUpdateCheckListVisible(!updateCheckListVisible);
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
                  flexDirection: 'row',
                  backgroundColor: '#F5F5F5',
                  marginTop: 0,
                  paddingVertical: 10,
                }}
              >
                <View style={{ width: 30 }} />
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
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
                <TouchableOpacity
                  style={{
                    width: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingRight: 10,
                  }}
                  onPress={() => {
                    Alert.alert(
                      'Delete',
                      'Do you want to delete Checklist ?',
                      [
                        { text: 'No', onPress: () => {}, style: 'cancel' },
                        {
                          text: 'Yes',
                          onPress: () => {
                            this.deleteChecklist(checkListItems);
                            this.setUpdateCheckListVisible(false);
                            this.fetchChecklistTasks();
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
                    color="#2E88FF"
                    size={20}
                  />
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Edit Title"
                onChangeText={(text) =>
                  this.setState({
                    checkListValue: text,
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
                editable={true}
                value={checkListValue}
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
                    if (checkListValue) {
                      this.updateEditedCheckList(checkListValue, checkListID);
                      this.setUpdateCheckListVisible(!updateCheckListVisible);
                      this.fetchChecklistTasks();
                      this.setState({
                        checkListValue: '',
                      });
                    } else {
                      Alert.alert('Checklist title should not be empty');
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
      </View>
    );
  };

  renderUpdateChecklistItem = () => {
    const {
      updateCheckListItemVisible,
      checkListItemValue,
      itemCheckListID,
      checklistItemID,
      popUpListNav,
    } = this.state;
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={updateCheckListItemVisible}
          onRequestClose={() => {
            this.setUpdateCheckListItemVisible(!updateCheckListItemVisible);
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
              this.setUpdateCheckListItemVisible(!updateCheckListItemVisible);
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
                    checkListItemValue: text,
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
                value={checkListItemValue}
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
                    if (checkListItemValue) {
                      this.updateEditedCheckListItem(
                        checkListItemValue,
                        itemCheckListID,
                        checklistItemID,
                      );
                      if (!popUpListNav) {
                        this.setUpdateCheckListItemVisible(!updateCheckListItemVisible);
                      } else {
                        this.setUpdateCheckListItemVisible(!updateCheckListItemVisible);
                        this.setState({
                          popUpListNav: false,
                          checklistItemID: '',
                        });
                      }
                      this.fetchChecklistTasks();
                    } else {
                      Alert.alert('Checklist Item title should not be empty');
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
      </View>
    );
  };

  renderAddAndUpdateDescription = (description) => {
    const { addDescriptionVisible, descriptionTitle } = this.state;
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={addDescriptionVisible}
          onRequestClose={() => {
            this.setAddDescriptionVisible(!addDescriptionVisible);
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
              this.setAddDescriptionVisible(!addDescriptionVisible);
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
                  {description ? 'Edit Description' : 'Add Description'}
                </Text>
              </View>
              <TextInput
                placeholder="New List Title"
                onChangeText={(text) =>
                  this.setState({
                    descriptionTitle: text,
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
                value={descriptionTitle}
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
                    if (descriptionTitle) {
                      this.createAndUpdateDescription(descriptionTitle);
                      this.setAddDescriptionVisible(!addDescriptionVisible);
                      this.fetchCardTasks();
                      this.setState({
                        descriptionTitle: '',
                      });
                    } else {
                      Alert.alert('Description should not be empty');
                    }
                  }}
                >
                  <Text
                    style={{
                      color: '#FFF',
                      fontSize: 20,
                    }}
                  >
                    {description ? 'Edit' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  renderUpdateMember = () => {
    const {
      boardMembers,
      updateMemberVisible,
      enableScrollViewScroll,
      pushOrPopMember,
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
          visible={updateMemberVisible}
          onRequestClose={() => {
            this.setUpdateMemberVisible(!updateMemberVisible);
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
                    fontSize: 18,
                  }}
                >
                  Add Member
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
                  data={boardMembers}
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
                  renderItem={({ item }) => {
                    const getIcon = _.includes(pushOrPopMember, item._id);
                    return (
                      <TouchableOpacity
                        style={{
                          height: 40,
                          backgroundColor: '#F5F5F5',
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingHorizontal: 10,
                        }}
                        key={item.key}
                        onPress={() => {
                          const update = _.includes(pushOrPopMember, item._id);
                          if (update) {
                            _.remove(pushOrPopMember, (mem) => mem === item._id);
                            this.setState({
                              pushOrPopMember,
                            });
                          } else {
                            pushOrPopMember.push(item._id);
                            this.setState({
                              pushOrPopMember,
                            });
                          }
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Avatar
                            avatarUrl={item.avatarURL}
                            avatarName={item.name}
                            avatarSize={28}
                          />
                          <Text
                            style={{
                              color: iOSColors.gray,
                              fontSize: 14,
                              paddingHorizontal: 10,
                            }}
                            numberOfLines={1}
                          >
                            {item.username}
                          </Text>
                        </View>
                        <View>
                          {getIcon && (
                            <Icon
                              name="checkbox-blank-circle"
                              type="material-community"
                              color={Colors.NAV_ICON}
                              size={20}
                            />
                          )}
                          {!getIcon && (
                            <Icon
                              name="checkbox-blank-circle-outline"
                              type="material-community"
                              color={Colors.NAV_ICON}
                              size={20}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
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
                    height: 30,
                    backgroundColor: Colors.NAV_ICON,
                    borderWidth: 1,
                    borderColor: 'transparent',
                    paddingHorizontal: 25,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    this.updateCardMember(pushOrPopMember);
                    this.setUpdateMemberVisible(!updateMemberVisible);
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
                    height: 30,
                    backgroundColor: Colors.NAV_ICON,
                    borderWidth: 1,
                    borderColor: 'transparent',
                    paddingHorizontal: 25,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    this.setUpdateMemberVisible(!updateMemberVisible);
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

  renderCard = () => {
    const { cardItemDetail } = this.state;
    if (cardItemDetail) {
      const mem = cardItemDetail.members;
      return (
        <View style={{ flex: 1 }}>
          <View style={{ backgroundColor: '#2E88FF' }}>
            <View style={{ paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'column' }}>
              <View
                style={{
                  flexDirection: 'row',
                  paddingVertical: 5,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      cardTitle: cardItemDetail.title,
                    });
                    this.setUpdateCardVisible(true);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      textAlign: 'left',
                      color: '#fff',
                    }}
                  >
                    {cardItemDetail.title}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ paddingVertical: 5, flexDirection: 'row' }}>
                {(mem && this.renderListAvatar(mem)) || null}
                <TouchableOpacity
                  style={{
                    borderRadius: 50,
                    backgroundColor: '#FFF',
                  }}
                  onPress={() => {
                    if (mem !== '' && mem !== null && mem !== '[]') {
                      this.setState({
                        pushOrPopMember: JSON.parse(mem),
                      });
                    }
                    this.setUpdateMemberVisible(true);
                  }}
                >
                  <MaterialIcon name="add" size={22} color="#2E88FF" style={{ padding: 3 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity
              style={{
                marginTop: 10,
                backgroundColor: '#EEF5FF',
                padding: 10,
                borderRadius: 10,
              }}
              onPress={() => {
                if (cardItemDetail.description) {
                  this.setState({
                    descriptionTitle: cardItemDetail.description,
                  });
                }
                this.setAddDescriptionVisible(true);
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  textAlign: 'left',
                  color: '#2E88FF',
                }}
              >
                Description
              </Text>
              {(cardItemDetail.description && (
                <Text
                  style={{
                    fontSize: 14,
                    textAlign: 'left',
                    color: iOSColors.gray,
                    marginTop: 5,
                  }}
                >
                  {cardItemDetail.description}
                </Text>
              )) ||
                null}
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  render() {
    const { commentText, height, cardItemDetail, popUpListNav } = this.state;
    const newStyle = { height };
    if (!this._isMounted) return false;
    return (
      <Screen>
        {!popUpListNav && (
          <NavBar
            navContainerStyle={{ backgroundColor: '#FFF' }}
            titleText="Card Detail"
            leftComponent={
              <TouchableOpacity
                style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                onPress={() => {
                  if (
                    Actions.currentScene === 'GroupCardDetailsScene' ||
                    Actions.currentScene === 'CardDetails'
                  ) {
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
              <TouchableOpacity
                style={[
                  styles.navSideButtonDimension,
                  styles.alignJustifyCenter,
                  styles.paddingRight10,
                ]}
                onPress={() => {
                  this.fetchCardTasks();
                  this.fetchChecklistTasks();
                  this.fetchCommentTasks();
                }}
              >
                <EvilIcon
                  name="refresh"
                  type="material-community"
                  color={Colors.NAV_ICON}
                  size={38}
                />
              </TouchableOpacity>
            }
          />
        )}
        {(popUpListNav && (
          <NavBar
            navContainerStyle={{ backgroundColor: 'rgba(46, 136, 255, 1)' }}
            leftComponent={
              <TouchableOpacity
                style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                onPress={() => {
                  this.setState({
                    popUpListNav: false,
                    checklistItemID: '',
                  });
                }}
              >
                <Icon name="chevron-left" type="material-community" color="#FFF" size={36} />
              </TouchableOpacity>
            }
            rightComponent={
              <View style={[styles.rowDirection, styles.paddingRight10]}>
                <TouchableOpacity
                  style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                  onPress={() => {
                    this.setUpdateCheckListItemVisible(true);
                  }}
                >
                  <Icon name="square-edit-outline" size={23} color="#FFF" />
                </TouchableOpacity>
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
                            this.deleteChecklistItem();
                            this.setState({
                              popUpListNav: false,
                            });
                            this.fetchChecklistTasks();
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
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        >
          {this.renderCard()}
          <View style={{ paddingHorizontal: 20 }}>
            <View
              style={{
                flex: 1,
                marginTop: 10,
                backgroundColor: '#EEF5FF',
                borderRadius: 10,
                paddingVertical: 10,
                // paddingLeft: 8,
              }}
            >
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  paddingHorizontal: 5,
                  paddingLeft: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: 'left',
                    color: '#2E88FF',
                    paddingVertical: 3,
                  }}
                >
                  Checklists
                </Text>
                <TouchableOpacity
                  style={{
                    borderRadius: 50,
                    backgroundColor: '#FFF',
                  }}
                  onPress={() => {
                    this.setAddChecklistVisible(true);
                  }}
                >
                  <MaterialIcon name="add" size={22} color="#2E88FF" style={{ padding: 3 }} />
                </TouchableOpacity>
              </View>
              {this.renderList()}
            </View>
          </View>
          {this.renderListcomment()}
        </ScrollView>
        {Application.APPCONFIG.BOARD_EDIT_UPDATE && (
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 10,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <TextInput
              placeholder="Write comments"
              style={[styles.flex1, styles.imagePreviewTextInput, newStyle]}
              multiline
              onChangeText={(text) => this.setState({ commentText: text })}
              onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}
              value={commentText}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              style={{
                height: 40,
                width: 40,
                backgroundColor: '#2E88FF',
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                if (commentText) {
                  this.addComments(commentText);
                  this.setState({
                    commentText: '',
                  });
                  this.fetchCommentTasks();
                }
              }}
            >
              <Icon name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        {Application.APPCONFIG.BOARD_EDIT_UPDATE && this.renderAddChecklist()}
        {Application.APPCONFIG.BOARD_EDIT_UPDATE && this.renderUpdateCardTitle()}
        {Application.APPCONFIG.BOARD_EDIT_UPDATE &&
          this.renderAddAndUpdateDescription(cardItemDetail.description)}
        {Application.APPCONFIG.BOARD_EDIT_UPDATE && this.renderUpdateChecklist()}
        {Application.APPCONFIG.BOARD_EDIT_UPDATE && this.renderAddItems()}
        {Application.APPCONFIG.BOARD_EDIT_UPDATE && this.renderUpdateChecklistItem()}
        {Application.APPCONFIG.BOARD_EDIT_UPDATE && this.renderUpdateMember()}
      </Screen>
    );
  }
}

CardDetails.propTypes = {
  cardItemDetail: PropTypes.object,
  boardId: PropTypes.string,
  boardName: PropTypes.string,
  groupID: PropTypes.string,
};

CardDetails.defaultProps = {
  cardItemDetail: {},
  boardId: '',
  boardName: '',
  groupID: '',
};
