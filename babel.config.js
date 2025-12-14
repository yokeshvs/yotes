module.exports = function (api) {
    // Force cache clear
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        ],
        plugins: ["react-native-reanimated/plugin"],
    };
};
