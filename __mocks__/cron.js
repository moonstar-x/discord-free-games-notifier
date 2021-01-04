const CronJob = jest.fn(function(_, action, onComplete) {
  this.onComplete = onComplete;
  this.nextDate = jest.fn(() => ({ format: jest.fn(() => 'time') }));
  this.start = jest.fn(() => action.bind(this)());

  return this;
});

module.exports = {
  CronJob
};
