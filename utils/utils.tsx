export const isDefined = (a: any) => typeof a !== 'undefined';

export const range = (start: number, count: number) =>
  Array.apply(0, Array(count)).map((_, i) => {
    return i + start;
  });

export const getRandomInt = (max) => Math.floor(Math.random() * max);

export const divide = (value: number, dividedBy: number) => (dividedBy === 0 ? 0 : value / dividedBy);

export function msToTime(duration) {
  const sec = Math.floor((duration / 1000) % 60),
    min = Math.floor((duration / (1000 * 60)) % 60),
    hrs = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return `${hrs < 10 ? '0' + hrs : hrs}:${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
}

export function isArrayEqual(a, b, orderMatters: boolean = false): boolean {
  let isEqual = false;

  if (a.length === b.length) {
    if (orderMatters) {
      isEqual = a.every((x, i) => x === b[i]);
    } else {
      isEqual = a.every((x) => b.includes(x));
    }
  }

  return isEqual;
}

/**
 * Determines if the user is on a mobile device or the window width is less than 1000px.
 * NOTE: exceptions to the mobile device rule are iPad pros and some tablets.
 */
const USER_AGENT_REGEXP: RegExp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
export const isMobileDevice = () => USER_AGENT_REGEXP.test(navigator.userAgent);

export const isMobileScreenSize = () => window.innerWidth < 1000;

export const atoi = (string: string, radix: number = 10) => parseInt(string, radix);

// Creates a custom style element uing the given styles and appends it to the DOM.
export function createStyle(styles: string) {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

export function lockVerticalScroll() {
  document.querySelector('html')?.classList.add('verticalScrollLocked');
  document.querySelector('body')?.classList.add('verticalScrollLocked');
}

export function unlockVerticalScroll() {
  document.querySelector('html')?.classList.remove('verticalScrollLocked');
  document.querySelector('body')?.classList.remove('verticalScrollLocked');
}
