module.exports = function (shipit) {
  shipit.initConfig({
    staging: {
      servers: 'myproject.com'
    }
  });

  shipit.task('pwd', function () {
    return shipit.remote('pwd');
  });
};