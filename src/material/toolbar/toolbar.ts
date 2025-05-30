/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Platform} from '@angular/cdk/platform';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  QueryList,
  ViewEncapsulation,
  inject,
  DOCUMENT,
} from '@angular/core';

@Directive({
  selector: 'mat-toolbar-row',
  exportAs: 'matToolbarRow',
  host: {'class': 'mat-toolbar-row'},
})
export class MatToolbarRow {}

@Component({
  selector: 'mat-toolbar',
  exportAs: 'matToolbar',
  templateUrl: 'toolbar.html',
  styleUrl: 'toolbar.css',
  host: {
    'class': 'mat-toolbar',
    '[class]': 'color ? "mat-" + color : ""',
    '[class.mat-toolbar-multiple-rows]': '_toolbarRows.length > 0',
    '[class.mat-toolbar-single-row]': '_toolbarRows.length === 0',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatToolbar implements AfterViewInit {
  protected _elementRef = inject(ElementRef);
  private _platform = inject(Platform);
  private _document = inject(DOCUMENT);

  // TODO: should be typed as `ThemePalette` but internal apps pass in arbitrary strings.
  /**
   * Theme color of the toolbar. This API is supported in M2 themes only, it has
   * no effect in M3 themes. For color customization in M3, see https://material.angular.io/components/toolbar/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
   */
  @Input() color?: string | null;

  /** Reference to all toolbar row elements that have been projected. */
  @ContentChildren(MatToolbarRow, {descendants: true}) _toolbarRows: QueryList<MatToolbarRow>;

  constructor(...args: unknown[]);
  constructor() {}

  ngAfterViewInit() {
    if (this._platform.isBrowser) {
      this._checkToolbarMixedModes();
      this._toolbarRows.changes.subscribe(() => this._checkToolbarMixedModes());
    }
  }

  /**
   * Throws an exception when developers are attempting to combine the different toolbar row modes.
   */
  private _checkToolbarMixedModes() {
    if (this._toolbarRows.length && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      // Check if there are any other DOM nodes that can display content but aren't inside of
      // a <mat-toolbar-row> element.
      const isCombinedUsage = Array.from<HTMLElement>(this._elementRef.nativeElement.childNodes)
        .filter(node => !(node.classList && node.classList.contains('mat-toolbar-row')))
        .filter(node => node.nodeType !== (this._document ? this._document.COMMENT_NODE : 8))
        .some(node => !!(node.textContent && node.textContent.trim()));

      if (isCombinedUsage) {
        throwToolbarMixedModesError();
      }
    }
  }
}

/**
 * Throws an exception when attempting to combine the different toolbar row modes.
 * @docs-private
 */
export function throwToolbarMixedModesError() {
  throw Error(
    'MatToolbar: Attempting to combine different toolbar modes. ' +
      'Either specify multiple `<mat-toolbar-row>` elements explicitly or just place content ' +
      'inside of a `<mat-toolbar>` for a single row.',
  );
}
