import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Actions } from 'react-native-router-flux';
import { BackHandler } from 'react-native';
import DbManager from '../../app/DBManager';
import CommentsList from '../CommentsList';

configure({ adapter: new Adapter() });

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
    group: {
      addCommentsListner: jest.fn(),
      removeCommentsListner: jest.fn(),
      fetchComment: jest.fn(),
    },

    cardComments: {
      fetchComment: jest.fn(() => ({ cardID: 'DFJEFHE', boardID: 'TEUFNDK' })),
      addCommentsListner: jest.fn(() => ({ commentCardId: 'YEIW3J' })),
      removeCommentsListner: jest.fn(() => ({ commentCardId: 'YEIW3J' })),
    },
  };
  return dbManager;
});
beforeEach(() => {
  jest.resetModules();
});

it('CommentsList renders correctly', () => {
  const tree = renderer.create(<CommentsList />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('handleBackPress', () => {
  const rootComponent = shallow(<CommentsList />);
  const instance = rootComponent.instance();
  const result = instance.handleBackPress();

  expect(result).toBe(true);
  expect(Actions.pop.mock.calls.length).toBe(1);
});

it('ChatMessageList - componentWillMount', async () => {
  DbManager.cardComments.fetchComment = jest.fn(() => ({ value: 123456 }));
  const tree = shallow(<CommentsList />);
  const instance = tree.instance();
  await instance.componentWillMount();
  expect(DbManager.cardComments.fetchComment).toBeCalled();
  expect(BackHandler.addEventListener).toBeCalled();
});

it('ChatMessageList - componentWillUnmount', () => {
  const tree = shallow(<CommentsList />);
  const instance = tree.instance();
  tree.unmount();
  expect(instance._isMounted).toBe(false);
  expect(DbManager.cardComments.removeCommentsListner).toBeCalled();
  expect(BackHandler.removeEventListener).toBeCalled();
});

it('ReplyMessage componentDidMount', () => {
  DbManager.cardComments.addCommentsListner.mockClear();
  const tree = shallow(<CommentsList />);
  const instance = tree.instance();
  expect(DbManager.cardComments.addCommentsListner).toBeCalled();
  expect(instance._isMounted).toBe(true);
});
it('key extractorcurrent scene is "CommentsList"', () => {
  const tree = renderer.create(<CommentsList cardId="7X856YIks9" />);
  const treeInstance = tree.getInstance();
  treeInstance.keyExtractor('XPP89611P');
  expect(Actions.cardId).toBeCalled();
});

it('Navbar onPress calls Actions.pop', () => {
  Actions.currentScene = 'CommentsList';
  Actions.currentScene = 'CommentsListScene';

  const root = shallow(<CommentsList />);
  const button = root
    .find('NavBar')
    .shallow()
    .find('TouchableOpacity');
  button.props().onPress();
  expect(Actions.pop.mock.calls.length).toBe(2);
});
it('Navbar onPress not to call Actions.pop', () => {
  Actions.currentScene = 'Comments';
  Actions.currentScene = 'CommentScene';
  Actions.pop.mockClear();
  const root = shallow(<CommentsList />);
  const button = root
    .find('NavBar')
    .shallow()
    .find('TouchableOpacity');
  button.props().onPress();
  expect(Actions.pop.mock.calls.length).toBe(0);
});
it('updateSize', () => {
  const height = 720;
  const rootComponent = shallow(<CommentsList />);

  const instance = rootComponent.instance();
  instance.updateSize(height);
  expect(rootComponent.state().height).toBe(height);
});
describe('CommentsList calls avatarComment', () => {
  const avatar = {
    avatarUrl: ' https://www.pexels.com/photo/nature-red-forest-leaves-33109/',
  };

  it('avatar comment ', () => {
    const tree = shallow(<CommentsList />);
    const instance = tree.instance();
    const avatarUrl = instance.avatarComment(avatar);
    expect(avatarUrl).toBeUndefined();
  });
});
describe('CommentsList calls renderRowComment', () => {
  const item = {
    userId: 'YEOENDK',
  };

  it('avatar comment ', () => {
    const tree = shallow(<CommentsList />);
    const instance = tree.instance();
    const RowComment = instance.renderRowComment(item);
    expect(RowComment).toBeUndefined();
  });
});
describe('CommentsList calls renderRowComment', () => {
  const commentToDelete = {
    boardId: 'TWUH79JEUHW',
    cardId: 'YE68WEBKE',
    commentId: 'YW083HR8',
  };

  it('avatar comment ', () => {
    const tree = shallow(<CommentsList />);
    const instance = tree.instance();
    const Commentdelete = instance.deleteComment(commentToDelete);
    expect(Commentdelete).toBeUndefined();
    expect(commentToDelete).toBeUndefined();
  });
});
describe('CommentsList calls addComments', () => {
  const commentToSave = {
    title: 'commentText',
    boardId: 'RT572JWSK8',
    cardId: 'JK893FENF',
    userId: 'YURW0QW8J',
  };
  it('avatar comment ', () => {
    const tree = shallow(<CommentsList />);
    const instance = tree.instance();
    const commentText = instance.addComments();
    expect(commentText).toBeUndefined();
    expect(commentText).toMatchObject(commentToSave);
  });
});
describe('CommentsList calls renderRowComment', () => {
  const fetchChecklist = {
    boardId: 'TWUH79JEUHW',
    cardId: 'YE68WEBKE',
  };

  it('avatar comment ', () => {
    const tree = shallow(<CommentsList />);
    const instance = tree.instance();
    const commentText = instance.fetchCommentTasks(fetchChecklist);
    expect(commentText).toBeUndefined();
    expect(fetchChecklist).toBeUndefined();
  });
});
describe('CommentsList calls renderRowComment', () => {
  it('avatar comment ', () => {
    const tree = shallow(<CommentsList />);
    const instance = tree.instance();
    const commentText = instance.updateComments();
    expect(commentText).toBeUndefined();
  });
});
describe('CommentsList calls renderRowComment', () => {
  const { updateComments } = this.state;

  it('avatar comment ', () => {
    const tree = shallow(<CommentsList />);
    const instance = tree.instance();
    const commentText = instance.renderListcomment(updateComments);
    expect(commentText).toBeUndefined();
  });
});
it('should render the onChange to textName', () => {
  const rootComponent = shallow(<CommentsList />);
  const authorInputComponent = rootComponent.find('TextInput').first();
  authorInputComponent.props().onChangeText('text');
  expect(rootComponent.state('commentText')).toEqual('text');
});

it('calls onContentSizeChange', () => {
  const rootComponent = shallow(<CommentsList />);
  const event = { nativeEvent: { contentSize: { height: 720 } } };
  const input = rootComponent.find('TextInput').first();
  input.props().onContentSizeChange(event);
  expect(rootComponent.state('height')).toEqual(720);
});
