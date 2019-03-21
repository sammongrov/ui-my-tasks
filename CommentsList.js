import React, { Component } from 'react';
import { View, TouchableOpacity, FlatList, BackHandler, Keyboard /* Alert */ } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from 'react-native-theme';
import { Actions } from 'react-native-router-flux';
// import Swipeout from 'react-native-swipeout';
import AppUtil from '@mongrov/utils'; 
import _ from 'lodash';
import { Colors } from '@ui/theme_default';
import {
  NavBar,
  Text,
  Screen,
  Icon,
  Avatar,
  TextInput /* FontAwesomeIcon */,
} from '@ui/components';
// import DBManager from '../app/DBManager';
import {DBManager} from 'app-module';
import {Application} from '@mongrov/config';

export default class CommentsList extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  static defaultProps = {};

  state = {
    commentText: '',
  };

  componentWillMount() {
    const { commentBoardId, commentCardId } = this.props;
    const fetchChecklist = {
      boardID: commentBoardId,
      cardID: commentCardId,
    };
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    DBManager.cardComments.fetchComment(fetchChecklist);
  }

  componentWillUnmount = () => {
    const { commentCardId } = this.props;
    this._isMounted = false;
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    DBManager.cardComments.removeCommentsListner(commentCardId, this.updateComments);
  };

  componentDidMount = () => {
    const { commentCardId } = this.props;
    this._isMounted = true;
    DBManager.cardComments.addCommentsListner(commentCardId, this.updateComments);
  };

  updateComments = async () => {
    if (!this._isMounted) return;
    const { commentCardId } = this.props;
    const comments = DBManager.cardComments.findByCardIdAsList(commentCardId);
    if (comments) {
      const updateCommentList = Object.keys(comments).map((key) => comments[key]);
      const Comments = _.orderBy(updateCommentList, 'createdAt', 'desc');
      this.comments = Comments;
      this.setState({
        updateComments: Comments,
      });
    }
  };

  handleBackPress = () => {
    Actions.pop();
    return true;
  };

  fetchCommentTasks = () => {
    const { commentCardId, commentBoardId } = this.props;
    const fetchChecklist = {
      boardID: commentBoardId,
      cardID: commentCardId,
    };
    DBManager.cardComments.fetchComment(fetchChecklist);
  };

  addComments = (commentText) => {
    const { commentBoardId, commentCardId } = this.props;
    const { board } = DBManager._taskManager;
    const commentToSave = {
      title: commentText,
      boardId: commentBoardId,
      cardId: commentCardId,
      userId: DBManager.app.userId,
    };
    if (commentToSave) {
      board.createComment(commentToSave);
      this.fetchCommentTasks();
      Keyboard.dismiss();
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

  keyExtractor = (item) => item._id;

  avatarComment = (avatar) => {
    if (avatar.avatarURL) {
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
  };

  updateSize = (height) => {
    this.setState({
      height,
    });
  };

  renderRowComment = ({ item }) => {
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
      // <Swipeout right={swipeBtns} autoClose={true} backgroundColor="transparent" buttonWidth={40}>
      <TouchableOpacity
        style={[styles.rowDirection, styles.paddingHorizontal10]}
        // onPress={() => {
        //   if (Actions.currentScene === 'Chat') {
        //     Actions.ChatRoom({ roomInfo: item });
        //   }
        // }}
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
                style={[styles.fontSize12, { color: Colors.TYP_GRAY }, { marginBottom: 5 }]}
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
              <Text style={[styles.flex1, styles.cListLastMessage, { color: Colors.TYP_GRAY }]}>
                {item.text}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      // </Swipeout>
    );
  };

  renderListcomment = () => {
    const { updateComments } = this.state;
    if (updateComments) {
      return (
        <FlatList
          keyExtractor={this.keyExtractor}
          data={updateComments}
          renderItem={this.renderRowComment}
        />
      );
    }
    return <View style={{ flex: 1 }} />;
  };

  render() {
    const { commentText, height } = this.state;
    const newStyle = { height };

    return (
      <Screen>
        <NavBar
          titleText="Comments"
          leftComponent={
            <TouchableOpacity
              style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
              onPress={() => {
                if (
                  Actions.currentScene === 'CommentsList' ||
                  Actions.currentScene === 'CommentsListScene'
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
        />
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          {this.renderListcomment()}
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
                  this.addComments(commentText);
                  this.setState({
                    commentText: '',
                  });
                  this.fetchCommentTasks();
                }}
              >
                <Icon name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Screen>
    );
  }
}

CommentsList.propTypes = {
  commentBoardId: PropTypes.string,
  commentCardId: PropTypes.string,
};

CommentsList.defaultProps = {
  commentBoardId: '',
  commentCardId: ',',
};
