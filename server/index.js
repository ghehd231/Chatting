import { GraphQLServer, PubSub } from 'graphql-yoga'; //graphql server를 쉽게 만들 수 있게 해주는 모듈
const pubsub = new PubSub();
const NEW_CHAT = 'NEW_CHAT';

let chattingLog = [
  {
    id: 0,
    writer: 'admin',
    description: 'HELLO',
  },
];

// graphql server를 만들기 위해서
// typeDefs 와 resolvers를 정의 해줘야 함

// typeDefs는 쿼리의 데이터 타입을 정의
// (!)는 필수라는 뜻
const typeDefs = `
    type Chat { 
    id: Int!
    writer: String!
    description: String!
    }
    type Query {
    chatting: [Chat]!
    }
    type Mutation {
        write(writer: String!, description: String!): String!
    },
    type Subscription {
        newChat: Chat
    }
`;
// write라는 mutation은 writer와 description을 인자로 받고, String을 리턴
// newChat이라는 subscription은 자료형 Chat을 리턴

// 실제 쿼리 요청이 들어왔을때 어떻게 해결할지 써주는 곳
const resolvers = {
  Query: {
    chatting: () => {
      return chattingLog;
    },
  },
  Mutation: {
    write: (_, { writer, description }) => {
      //첫번째는 안쓰임 , 두번째 인자로 저장할 데이터
      const id = chattingLog.length; // 채팅로그의 길이를 id로 받음
      const newChat = {
        id,
        writer,
        description,
      };
      chattingLog.push(newChat); //채팅로그가 배열이랑 push 로 저장
      return 'YES'; //YES 리턴 해줌
    },
  },
  Subscription: {
    newChat: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(NEW_CHAT),
    },
  },
};

const server = new GraphQLServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  context: { pubsub },
});
// Subscription로 먼저 “NEW_CHAT”이라는 토픽(topic)을 구독을 해놓으면 mutation에서 “NEW_CHAT” 토픽에게 newChat 데이터를 발행

// const opts = {
//     port: 8000,
//     endpoint: '/graphql',
//   };
// const server = new GraphQLServer({ typeDefs, resolvers, opts });

server.start(() => console.log(`Graphql Server Running on ${server.options.port}`));
