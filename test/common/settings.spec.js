/* eslint-disable camelcase */
const fs = require('fs');

let settings; // since I'm testing variables, I have to reset the modules so that they're recomputed.

const existsSyncMock = jest.spyOn(fs, 'existsSync');
const readFileSyncMock = jest.spyOn(fs, 'readFileSync');

describe('Common - Settings', () => {
  describe('With Config File', () => {
    const mockedFile = {
      discord_token: 'DISCORD_TOKEN',
      prefix: 'PREFIX',
      owner_id: 'OWNER_ID',
      invite_url: 'INVITE_URL'
    };

    beforeAll(() => {
      existsSyncMock.mockImplementation(() => true);
      readFileSyncMock.mockImplementation(() => JSON.stringify(mockedFile));
      process.env = {};

      jest.resetModules();
      settings = require('../../src/common/settings');
    });

    it('should have discordToken be set to what is in the config file.', () => {
      expect(settings.discordToken).toBe(mockedFile.discord_token);
    });

    it('should have prefix be set to what is in the config file.', () => {
      expect(settings.prefix).toBe(mockedFile.prefix);
    });

    it('should have ownerID be set to what is in the config file.', () => {
      expect(settings.ownerID).toBe(mockedFile.owner_id);
    });

    it('should have inviteURL be set to what is in the config file.', () => {
      expect(settings.inviteURL).toBe(mockedFile.invite_url);
    });
  });

  describe('With Environment Variables', () => {
    const DISCORD_TOKEN = 'DISCORD_TOKEN';
    const PREFIX = 'PREFIX';
    const OWNER_ID = 'OWNER_ID';
    const INVITE_URL = 'INVITE_URL';
    
    beforeAll(() => {
      existsSyncMock.mockImplementation(() => false);
      process.env = {
        DISCORD_TOKEN,
        PREFIX,
        OWNER_ID,
        INVITE_URL
      };

      jest.resetModules();
      settings = require('../../src/common/settings');
    });

    it('should have discordToken be set to DISCORD_TOKEN.', () => {
      expect(settings.discordToken).toBe(DISCORD_TOKEN);
    });

    it('should have prefix be set to PREFIX.', () => {
      expect(settings.prefix).toBe(PREFIX);
    });

    it('should have ownerID be set to OWNER_ID.', () => {
      expect(settings.ownerID).toBe(OWNER_ID);
    });

    it('should have inviteURL be set to INVITE_URL.', () => {
      expect(settings.inviteURL).toBe(INVITE_URL);
    });
  });

  describe('Without Anything', () => {
    beforeAll(() => {
      existsSyncMock.mockImplementation(() => false);
      process.env = {};

      jest.resetModules();
      settings = require('../../src/common/settings');
    });

    it('should have discordToken be set to null.', () => {
      expect(settings.discordToken).toBeNull();
    });

    it('should have prefix be set to $.', () => {
      expect(settings.prefix).toBe('$');
    });

    it('should have ownerID be set to null.', () => {
      expect(settings.ownerID).toBeNull();
    });

    it('should have inviteURL be set to null.', () => {
      expect(settings.inviteURL).toBeNull();
    });
  });
});
