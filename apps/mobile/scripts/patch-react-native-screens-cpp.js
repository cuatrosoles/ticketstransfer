#!/usr/bin/env node
/**
 * Aplica parches C++ a react-native-screens para RN 0.73:
 * getContentOriginOffset(bool) -> getContentOriginOffset() (firma compatible con LayoutableShadowNode en RN 0.73)
 */
const fs = require('fs');
const path = require('path');

// Con node-linker=hoisted, packages están en root del monorepo (scripts está en apps/mobile/scripts)
const base = path.join(__dirname, '../../../node_modules/react-native-screens');
const files = [
  {
    file: 'common/cpp/react/renderer/components/rnscreens/RNSScreenShadowNode.h',
    from: '  Point getContentOriginOffset(bool includeTransform) const override;',
    to: '  Point getContentOriginOffset() const override;',
  },
  {
    file: 'common/cpp/react/renderer/components/rnscreens/RNSScreenShadowNode.cpp',
    from: `Point RNSScreenShadowNode::getContentOriginOffset(
    bool /*includeTransform*/) const {`,
    to: 'Point RNSScreenShadowNode::getContentOriginOffset() const {',
  },
  {
    file: 'common/cpp/react/renderer/components/rnscreens/RNSModalScreenShadowNode.h',
    from: '  Point getContentOriginOffset(bool includeTransform) const override;',
    to: '  Point getContentOriginOffset() const override;',
  },
  {
    file: 'common/cpp/react/renderer/components/rnscreens/RNSModalScreenShadowNode.cpp',
    from: `Point RNSModalScreenShadowNode::getContentOriginOffset(
    bool /*includeTransform*/) const {`,
    to: 'Point RNSModalScreenShadowNode::getContentOriginOffset() const {',
  },
];

for (const { file: relPath, from, to } of files) {
  const fullPath = path.join(base, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn('patch-react-native-screens-cpp: skip (not found)', relPath);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes(from)) {
    if (content.includes(to)) {
      continue; // ya parcheado
    }
    console.warn('patch-react-native-screens-cpp: pattern not found in', relPath);
    continue;
  }
  content = content.replace(from, to);
  fs.writeFileSync(fullPath, content);
  console.log('patch-react-native-screens-cpp: patched', relPath);
}
