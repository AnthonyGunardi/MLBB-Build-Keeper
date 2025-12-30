const bcrypt = require('bcrypt');
const UserModel = require('../models/user');

const sequelizeMock = {
  define: jest.fn((name, schema, options) => {
    const Model = function () { };
    Model.hooks = options.hooks;
    Model.prototype = {};
    return Model;
  })
};

const DataTypesMock = {
  INTEGER: 'INTEGER',
  STRING: 'STRING',
  ENUM: jest.fn()
};

describe('User Model', () => {
  let User;

  beforeAll(() => {
    User = UserModel(sequelizeMock, DataTypesMock);
  });

  describe('Hooks', () => {
    it('beforeCreate hashes password', async () => {
      const user = {
        password_hash: 'plain',
        changed: jest.fn()
      };

      await User.hooks.beforeCreate(user);

      expect(user.password_hash).not.toBe('plain');
      expect(await bcrypt.compare('plain', user.password_hash)).toBe(true);
    });

    it('beforeCreate does NOT hash if password_hash is falsy', async () => {
      const user = {
        password_hash: null,
        changed: jest.fn()
      };

      await User.hooks.beforeCreate(user);

      expect(user.password_hash).toBeNull();
    });

    it('beforeUpdate hashes password if changed', async () => {
      const user = {
        password_hash: 'newpass',
        changed: jest.fn().mockReturnValue(true)
      };

      await User.hooks.beforeUpdate(user);

      expect(user.password_hash).not.toBe('newpass');
      expect(await bcrypt.compare('newpass', user.password_hash)).toBe(true);
    });

    it('beforeUpdate does NOT hash if password not changed', async () => {
      const user = {
        password_hash: 'hashed',
        changed: jest.fn().mockReturnValue(false)
      };
      const originalHash = user.password_hash;

      await User.hooks.beforeUpdate(user);

      expect(user.password_hash).toBe(originalHash);
    });
  });

  describe('validPassword', () => {
    it('validates correct password', async () => {
      const hash = await bcrypt.hash('secret', 10);
      const user = new User();
      user.password_hash = hash;
      user.validPassword = User.prototype.validPassword; // Bind method manually for the mock instance

      const isValid = await user.validPassword('secret');
      expect(isValid).toBe(true);
    });

    it('invalidates incorrect password', async () => {
      const hash = await bcrypt.hash('secret', 10);
      const user = new User();
      user.password_hash = hash;
      user.validPassword = User.prototype.validPassword;

      const isValid = await user.validPassword('wrong');
      expect(isValid).toBe(false);
    });
  });
});
