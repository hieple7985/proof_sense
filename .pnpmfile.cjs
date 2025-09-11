// Force linking workspace packages for runtime resolution
module.exports = {
  config(pnpmCfg) {
    pnpmCfg.hoistPattern = ['*'];
    pnpmCfg.publicHoistPattern = ['*'];
    pnpmCfg.hoistWorkspacePackages = true;
    pnpmCfg.linkWorkspacePackages = true;
    pnpmCfg.nodeLinker = 'hoisted';
    return pnpmCfg;
  }
};

