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
