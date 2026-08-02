export default {
  title: "Test/Hello",
  render: () => {
    const el = document.createElement("div");
    el.textContent = "Hello Storybook";
    return el;
  },
};
