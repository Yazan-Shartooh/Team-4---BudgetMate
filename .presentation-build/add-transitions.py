import sys, re, zipfile
from lxml import etree as ET
source, target = sys.argv[1:3]
P = 'http://schemas.openxmlformats.org/presentationml/2006/main'
count = 0
with zipfile.ZipFile(source) as zin, zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as zout:
    for info in zin.infolist():
        data = zin.read(info.filename)
        if re.fullmatch(r'ppt/slides/slide\d+\.xml', info.filename):
            root = ET.fromstring(data)
            for existing in root.findall(f'{{{P}}}transition'):
                root.remove(existing)
            tr = ET.Element(f'{{{P}}}transition', spd='fast', advClick='1')
            ET.SubElement(tr, f'{{{P}}}fade')
            at = next((i for i,c in enumerate(root) if c.tag in [f'{{{P}}}timing',f'{{{P}}}extLst']),len(root))
            root.insert(at, tr)
            assert tr.find(f'{{{P}}}fade') is not None and 'advTm' not in tr.attrib
            data = ET.tostring(root,xml_declaration=True,encoding='utf-8',standalone=True)
            count += 1
        zout.writestr(info, data)
assert count == int(sys.argv[3] if len(sys.argv)>3 else 10), count
print(f'Added click-controlled fade transitions to {count} slides.')
