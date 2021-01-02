const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, '../../config/settings.json');
const configFromFile = fs.existsSync(configFilePath) ? JSON.parse(fs.readFileSync(configFilePath)) : {};

const discordToken = process.env.DISCORD_TOKEN || configFromFile.discord_token || null;
const prefix = process.env.PREFIX || configFromFile.prefix || '$';
const ownerID = process.env.OWNER_ID || configFromFile.owner_id || null;
const inviteURL = process.env.INVITE_URL || configFromFile.invite_url || null;

module.exports = {
  discordToken,
  prefix,
  ownerID,
  inviteURL
};
