/** Open the same contextual menu/dock a user would use before operating a control. */
export async function revealEditorControl(page, selector) {
  if(selector==='#asset-background'&&!await page.locator(selector).isVisible()){const assetId=await page.evaluate(()=>window.__mapEditorDiagnostics().chosenAsset);await page.locator('[data-dock="assets"]').click();await page.locator(`[data-asset="${assetId}"]`).click();}
  const target = page.locator(selector).first();
  const context = await target.evaluate(n => ({ menu: n.closest('.menu')?.id, dock: n.closest('[data-dock-panel]')?.dataset.dockPanel }));
  if (context.dock) await page.locator(`[data-dock="${context.dock}"]`).click();
  if (context.menu && !await page.locator(`#${context.menu}`).evaluate(n => n.open)) await page.locator(`#${context.menu} > summary`).click();
  // Property foldouts are independent of menus and never change authoring state.
  await target.evaluate(n => { for (let parent=n.parentElement;parent;parent=parent.parentElement) if (parent.tagName==='DETAILS'&&!parent.classList.contains('menu')) parent.open=true; });
}
export async function editorClick(page, selector, options) {
  const tool = selector.match(/^\[data-tool=["']([^"']+)["']\]$/)?.[1];
  if (tool && /^(walk|block|portal)-(rect|poly|spline)$/.test(tool)) {
    const [kind,shape]=tool.split('-');
    await page.locator('[data-domain="navigation"]').click();
    await page.selectOption('#region-shape',shape);
    await page.locator(`[data-region-kind="${kind}"]`).click();
    return;
  }
  if (tool && ['brush','paint-rect','erase'].includes(tool)) await page.locator('[data-domain="scene"]').click();
  await revealEditorControl(page,selector);
  await page.locator(selector).click(options);
}
export async function editorSelect(page,selector,value) {
  await revealEditorControl(page,selector);await page.selectOption(selector,value);
}

export async function editorCheck(page,selector,checked=true){await revealEditorControl(page,selector);await page.locator(selector).setChecked(checked);}
