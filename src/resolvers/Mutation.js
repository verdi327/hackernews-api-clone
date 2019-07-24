'use strict';
const { APP_SECRET, getUserId } = require('../utils');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutation = {
  post(root, args, context) {
    const userId = getUserId(context);
    return context.prisma.createLink({
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } }
    });
  },
  
  updateLink(root, args, context) {
    return context.prisma.updateLink({
      data: {
        url: args.url,
        description: args.description
      },
      where: {
        id: args.id
      }
    });
  },
  
  deleteLink(root, args, context) {
    return context.prisma.deleteLink({
      id: args.id
    });
  },

  async signup(root, args, context, info) {
    const password = await bcryptjs.hash(args.password, 10);
    const user = await context.prisma.createUser({...args, password});
    const token = await jwt.sign({userId: user.id}, APP_SECRET);
    return {
      token,
      user
    };
  },

  async login(root, args, context, info) {
    const user = await context.prisma.user({email: args.email});
    if (!user) {
      throw new Error('invalid email or password');
    }

    const valid = await bcryptjs.compare(args.password, user.password);
    if (!valid) {
      throw new Error('invalid email or password');
    }

    const token = jwt.sign({userId: user.id}, APP_SECRET);

    return {
      token,
      user
    };
  },

  async vote(root, args, context, info) {
    const userId = getUserId(context);
    
    const voteExists = await context.prisma.$exists.vote({
      user: { id: userId },
      link: { id: args.linkId }
    });

    if (voteExists) {
      throw new Error(`Already voted for link: ${args.linkId}`);
    }
    
    return context.prisma.createVote({
      user: { connect: {id: userId} },
      link: { connect: { id: args.linkId } }
    });
  }
};


module.exports = Mutation;