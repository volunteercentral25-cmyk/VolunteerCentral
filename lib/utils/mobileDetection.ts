export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile',
    'tablet'
  ];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
}

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return window.innerWidth <= 768;
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') {
    return 'desktop';
  }
  
  const width = window.innerWidth;
  
  if (width <= 768) {
    return 'mobile';
  } else if (width <= 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}
