import { Page, KeyInput } from "puppeteer";

type Action =
  | "key"
  | "type"
  | "mouse_move"
  | "left_click"
  | "left_click_drag"
  | "right_click"
  | "middle_click"
  | "double_click"
  | "screenshot"
  | "cursor_position";

export async function goToUrl({
  page,
  url,
}: {
  page: Page;
  url: string;
}): Promise<{ newPage: Page; screenshot?: string }> {
  console.log(`Navigating to ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const screenshotBuffer = await page.screenshot({ encoding: "base64" });
  
  return { newPage: page, screenshot: screenshotBuffer };
}

export const saveToMemory = async ({
  page,
  information,
}: {
  page: Page;
  information: string;
}): Promise<{ newPage: Page; content: string }> => {
  console.log(`Saving ${information} to memory`);
  // Implement your memory saving logic here
  return { newPage: page, content: "successfully saved to memory" };
};

export async function claudeComputerTool({
  action,
  text,
  coordinate,
  page,
}: {
  action: Action;
  text?: string;
  coordinate?: [number, number];
  page: Page;
  url: string;
}): Promise<{ newPage: Page; screenshot?: string }> {
  /**
   * Executes the specified action on the Puppeteer page.
   *
   * @param action - The action to perform (e.g., "key", "type", "mouse_move").
   * @param text - Required by "key" and "type" actions; the text or key combination to input.
   * @param coordinate - Required by "mouse_move" and "left_click_drag"; the [x, y] position.
   * @param page - The Puppeteer Page object.
   * @param url - The URL to navigate to (if needed).
   * @returns An object containing the updated Page.
   */

  // Helper function to translate key names to Puppeteer-compatible keys
  function translateKey(key: string): KeyInput {
    const lowercaseKey = key.toLowerCase();
    const keyMap: { [key: string]: KeyInput } = {
      // xdottool: "puppeteer" (all keys are lowercase)
      return: "Enter",
      enter: "Enter",
      tab: "Tab",
      backspace: "Backspace",
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      space: "Space",
      ctrl: "Control",
      control: "Control",
      alt: "Alt",
      shift: "Shift",
      meta: "Meta",
      command: "Meta",
      windows: "Meta",
      esc: "Escape",
      escape: "Escape",
      // Numpad keys
      kp_0: "Numpad0",
      kp_1: "Numpad1",
      kp_2: "Numpad2",
      kp_3: "Numpad3",
      kp_4: "Numpad4",
      kp_5: "Numpad5",
      kp_6: "Numpad6",
      kp_7: "Numpad7",
      kp_8: "Numpad8",
      kp_9: "Numpad9",
      // Add more mappings as needed
      page_down: "PageDown",
      page_up: "PageUp",

      // Function keys
      f1: "F1",
      f2: "F2",
      f3: "F3",
      f4: "F4",
      f5: "F5",
      f6: "F6",
      f7: "F7",
      f8: "F8",
      f9: "F9",
      f10: "F10",
      f11: "F11",
      f12: "F12",

      // Navigation
      home: "Home",
      end: "End",
      insert: "Insert",
      delete: "Delete",

      // Modifiers with directional variants
      shift_l: "ShiftLeft",
      shift_r: "ShiftRight",
      control_l: "ControlLeft",
      control_r: "ControlRight",
      alt_l: "AltLeft",
      alt_r: "AltRight",

      // Media keys
      audiovolumemute: "AudioVolumeMute",
      audiovolumedown: "AudioVolumeDown",
      audiovolumeup: "AudioVolumeUp",

      // Additional special keys
      print: "PrintScreen",
      scroll_lock: "ScrollLock",
      pause: "Pause",
      menu: "ContextMenu",

      // Numpad
      kp_enter: "NumpadEnter",
      kp_multiply: "NumpadMultiply",
      kp_add: "NumpadAdd",
      kp_subtract: "NumpadSubtract",
      kp_decimal: "NumpadDecimal",
      kp_divide: "NumpadDivide",
    };
    return keyMap[lowercaseKey] || key;
  }

  try {
    if (action === "mouse_move" || action === "left_click_drag") {
      // Validate coordinates
      if (!coordinate) {
        throw new Error(`coordinate is required for action '${action}'`);
      }
      if (text !== undefined) {
        throw new Error(`text is not accepted for action '${action}'`);
      }
      if (!Array.isArray(coordinate) || coordinate.length !== 2) {
        throw new Error(`coordinate must be a tuple of length 2`);
      }
      if (!coordinate.every((i) => typeof i === "number" && i >= 0)) {
        throw new Error(`coordinate must be a tuple of non-negative numbers`);
      }
      const [x, y] = coordinate;

      if (action === "mouse_move") {
        // Move the mouse to (x, y)
        await page.mouse.move(x, y);
      } else {
        // Perform a click and drag to (x, y)
        await page.mouse.move(x, y);
        await page.mouse.down();
        // Define the drag destination; adjust as needed
        const dragDestination = { x: x + 100, y: y + 100 };
        await page.mouse.move(dragDestination.x, dragDestination.y, {
          steps: 10,
        });
        await page.mouse.up();
      }

      const screenshotBuffer = await page.screenshot({ encoding: "base64" });
      return { newPage: page, screenshot: screenshotBuffer };
    } else if (action === "key" || action === "type") {
      // Validate text input
      if (text === undefined) {
        throw new Error(`text is required for action '${action}'`);
      }
      if (coordinate !== undefined) {
        throw new Error(`coordinate is not accepted for action '${action}'`);
      }

      if (action === "key") {
        // Handle key combinations (e.g., "ctrl+s")
        const keys: KeyInput[] = text.split("+").map((k) => translateKey(k));
        const modifierKeys: KeyInput[] = ["Alt", "Control", "Shift", "Meta"];
        const pressedModifiers: KeyInput[] = [];

        // Press down modifier keys
        for (const key of keys.slice(0, -1)) {
          if (modifierKeys.includes(key)) {
            await page.keyboard.down(key);
            pressedModifiers.push(key);
          } else {
            // Non-modifier keys (including PageUp/PageDown)
            await page.keyboard.down(key);
          }
        }

        // Press the last key
        const lastKey: KeyInput = keys[keys.length - 1];
        await page.keyboard.press(lastKey);

        // Release modifier keys in reverse order
        for (const key of pressedModifiers.reverse()) {
          await page.keyboard.up(key);
        }
      } else {
        // Type the text string
        await page.keyboard.type(text);
      }

      const screenshotBuffer = await page.screenshot({ encoding: "base64" });
      return { newPage: page, screenshot: screenshotBuffer };
    } else if (
      [
        "left_click",
        "right_click",
        "double_click",
        "middle_click",
        "screenshot",
        "cursor_position",
      ].includes(action)
    ) {
      // These actions do not accept text or coordinate parameters
      if (text !== undefined) {
        throw new Error(`text is not accepted for action '${action}'`);
      }
      if (coordinate !== undefined) {
        throw new Error(`coordinate is not accepted for action '${action}'`);
      }

      if (action === "screenshot") {
        // Take a screenshot

        const screenshotBuffer = await page.screenshot({ encoding: "base64" });
        return { newPage: page, screenshot: screenshotBuffer };
      } else if (action === "cursor_position") {
        // Puppeteer does not support retrieving the cursor position
        throw new Error("cursor_position action is not supported in Puppeteer");
      } else {
        // Click actions
        // Default to clicking at the center of the viewport
        const viewport = page.viewport();
        const x = viewport ? viewport.width / 2 : 0;
        const y = viewport ? viewport.height / 2 : 0;

        let button: "left" | "right" | "middle" = "left";
        let clickOptions: {
          button?: "left" | "right" | "middle";
          clickCount?: number;
        } = {};

        if (action === "left_click") {
          button = "left";
        } else if (action === "right_click") {
          button = "right";
        } else if (action === "middle_click") {
          button = "middle";
        } else if (action === "double_click") {
          button = "left";
          clickOptions.clickCount = 2;
        }

        // Perform the click action
        await page.mouse.click(x, y, { button, ...clickOptions });

        const screenshotBuffer = await page.screenshot({ encoding: "base64" });
        return { newPage: page, screenshot: screenshotBuffer };
      }
    } else {
      // Invalid action provided
      throw new Error(`Invalid action: '${action}'`);
    }
  } catch (error) {
    console.error(`Error executing action '${action}': ${error}`);
    throw error;
  }
}
