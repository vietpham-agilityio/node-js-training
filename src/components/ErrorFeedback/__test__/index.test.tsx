import { render } from "@testing-library/react-native";
import ErrorFeedback from "../.";

describe("ErrorFeedback", () => {
  it("should render correctly", () => {
    const { getByText } = render(<ErrorFeedback error="Test error" />);
    expect(getByText("Test error")).toBeTruthy();
  });

  it("should render correct snapshot", () => {
    const { toJSON } = render(<ErrorFeedback error="Test error" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
