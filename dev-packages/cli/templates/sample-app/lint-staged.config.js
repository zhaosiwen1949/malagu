module.exports = {
    '*.(ts|tsx)': () => ['yarn lint', 'yarn compile', 'git add -A'],
};