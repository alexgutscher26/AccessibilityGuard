import { NextResponse } from 'next/server';
import axios from 'axios';
import { parse } from 'node-html-parser';

interface AccessibilityIssue {
  type: string;
  message: string;
  element: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    try {
      new URL(url); // Validate URL format
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const response = await axios.get(url, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; AccessibilityBot/1.0)',
      },
      timeout: 10000,
      maxRedirects: 5,
    });

    // Parse HTML
    const root = parse(response.data);
    const accessibilityIssues: AccessibilityIssue[] = [];

    // Check document structure
    if (!root.querySelector('html[lang]')) {
      accessibilityIssues.push({
        type: 'html-has-lang',
        message: 'The <html> element should have a lang attribute',
        element: root.querySelector('html')?.outerHTML || '<html>',
        impact: 'serious'
      });
    }

    if (!root.querySelector('title')) {
      accessibilityIssues.push({
        type: 'document-title',
        message: 'Document should have a title',
        element: '<head>',
        impact: 'serious'
      });
    }

    if (!root.querySelector('main')) {
      accessibilityIssues.push({
        type: 'landmark-one-main',
        message: 'Document should have one main landmark',
        element: '<body>',
        impact: 'moderate'
      });
    }

    // Check semantic structure
    const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (!root.querySelector('h1')) {
      accessibilityIssues.push({
        type: 'page-has-heading-one',
        message: 'Page should contain a level-one heading',
        element: '<body>',
        impact: 'serious'
      });
    }

    let previousLevel = 0;
    headings.forEach(el => {
      const level = parseInt(el.tagName.toLowerCase()[1]);
      if (previousLevel > 0 && level - previousLevel > 1) {
        accessibilityIssues.push({
          type: 'heading-order',
          message: `Skipped heading level: h${previousLevel} to h${level}`,
          element: el.outerHTML,
          impact: 'moderate'
        });
      }
      previousLevel = level;
    });

    // Check ARIA attributes
    root.querySelectorAll('*').forEach(el => {
      const attributes = el.attributes;
      
      // Check for empty ARIA attributes
      Object.keys(attributes).forEach(attr => {
        if (attr.startsWith('aria-') && !attributes[attr]) {
          accessibilityIssues.push({
            type: 'aria-empty',
            message: `Empty ARIA attribute: ${attr}`,
            element: el.outerHTML,
            impact: 'critical'
          });
        }
      });

      // Check for invalid role values
      const role = el.getAttribute('role');
      if (role) {
        const validRoles = [
          'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
          'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
          'contentinfo', 'definition', 'dialog', 'directory', 'document',
          'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
          'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
          'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
          'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
          'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
          'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
          'slider', 'spinbutton', 'status', 'switch', 'tab', 'table',
          'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar',
          'tooltip', 'tree', 'treegrid', 'treeitem'
        ];

        if (!validRoles.includes(role)) {
          accessibilityIssues.push({
            type: 'aria-roles',
            message: `Invalid role value: ${role}`,
            element: el.outerHTML,
            impact: 'serious'
          });
        }
      }
    });

    // Check images
    root.querySelectorAll('img').forEach(el => {
      if (!el.getAttribute('alt')) {
        accessibilityIssues.push({
          type: 'image-alt',
          message: 'Image missing alt text',
          element: el.outerHTML,
          impact: 'critical'
        });
      }
    });

    // Check form controls
    root.querySelectorAll('input, select, textarea').forEach(el => {
      const id = el.getAttribute('id');
      const type = el.getAttribute('type');
      const hasLabel = id ? root.querySelector(`label[for="${id}"]`) : false;
      const hasAriaLabel = el.getAttribute('aria-label');
      const hasAriaLabelledBy = el.getAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && type !== 'hidden') {
        accessibilityIssues.push({
          type: 'label',
          message: 'Form control missing label or accessible name',
          element: el.outerHTML,
          impact: 'critical'
        });
      }
    });

    // Check interactive elements
    root.querySelectorAll('button, a, [role="button"], [role="link"]').forEach(el => {
      const text = el.text.trim();
      const hasAriaLabel = el.getAttribute('aria-label');
      const hasAriaLabelledBy = el.getAttribute('aria-labelledby');

      if (!text && !hasAriaLabel && !hasAriaLabelledBy) {
        accessibilityIssues.push({
          type: 'interactive-element-name',
          message: `${el.tagName.toLowerCase()} missing accessible name`,
          element: el.outerHTML,
          impact: 'critical'
        });
      }
    });

    // Check tabindex values
    root.querySelectorAll('[tabindex]').forEach(el => {
      const tabindex = parseInt(el.getAttribute('tabindex') || '0');
      if (tabindex > 0) {
        accessibilityIssues.push({
          type: 'tabindex',
          message: 'Avoid positive tabindex values',
          element: el.outerHTML,
          impact: 'serious'
        });
      }
    });

    // Group issues by category
    const violations = accessibilityIssues.map(issue => ({
      id: issue.type,
      impact: issue.impact,
      description: issue.message,
      nodes: [{
        html: issue.element
      }]
    }));

    const axeResults = {
      violations,
      passes: [],
      incomplete: [],
      inapplicable: []
    };

    return NextResponse.json({
      html: response.data,
      axeResults
    });

  } catch (error) {
    console.error('URL fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch website',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
