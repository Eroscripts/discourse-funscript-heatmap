// Discourse API Type Definitions

declare module "discourse/lib/api" {
  export interface PluginApi {
    /**
     * Called when the user navigates to a new page
     */
    onPageChange(callback: (url: string) => void): void;

    /**
     * Decorate cooked elements (processed post content)
     */
    decorateCookedElement(
      callback: (cookedElement: HTMLElement) => void | Promise<void>,
      options?: { id?: string; onlyStream?: boolean },
    ): void;

    /**
     * Access to the Ember container for dependency injection
     */
    container: any;
  }

  export function apiInitializer(callback: (api: PluginApi) => void): any;
}

declare module "discourse/lib/click-track" {
  interface ClickTracker {
    /**
     * Tracks a click event and handles navigation
     * @param event - The mouse event
     * @param owner - The Ember application owner/container
     * @param options - Optional configuration
     * @returns boolean for navigation control, or Promise if returnPromise is true
     */
    trackClick(
      event: MouseEvent,
      owner?: any,
      options?: { returnPromise?: boolean },
    ): boolean | Promise<any>;
  }

  const ClickTrack: ClickTracker;
  export default ClickTrack;
}

// Global Discourse types that might be available
declare global {
  interface Window {
    caches: CacheStorage;
  }
}

// Additional DOM types for better type safety
declare global {
  interface HTMLAnchorElement {
    href: string;
  }
}
