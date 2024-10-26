import { Page } from "puppeteer";

export function scaleCoordinates(
    x: number,
    y: number,
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number
  ): { x: number; y: number } {
    const xScalingFactor = targetWidth / sourceWidth;
    const yScalingFactor = targetHeight / sourceHeight;
  
    return {
      x: x * xScalingFactor,
      y: y * yScalingFactor,
    };
  }
export async function getAdjustedCoordinates(page: Page, x: number, y: number) {
    // Retrieve device pixel ratio and scroll offsets
    const { devicePixelRatio, scrollX, scrollY } = await page.evaluate(() => ({
      devicePixelRatio: window.devicePixelRatio,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    }));
  
    // Optionally scale coordinates if viewport size differs
    const viewport = await page.viewport();
    const scaledCoordinates = scaleCoordinates(
      x,
      y,
      1280, // source width
      800,  // source height
      viewport?.width ?? 1280,
      viewport?.height ?? 800
    );
  
    // Adjust for scroll and device pixel ratio
    const adjustedX = (scaledCoordinates.x - scrollX) * devicePixelRatio;
    const adjustedY = (scaledCoordinates.y - scrollY) * devicePixelRatio;
  
    return { x: adjustedX, y: adjustedY };
  }