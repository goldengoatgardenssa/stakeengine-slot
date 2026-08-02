export default {
  title: "Test/Hello",
};

export const Hello = () => {
  const el = document.createElement("div");
  el.textContent = "Hello Storybook";
  return el;
};
