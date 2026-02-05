// import React, { useState, useRef, useMemo, useCallback } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
// import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';

// interface FacetValue {
//   value: string;
//   count: number;
// }

// interface Facet {
//   field: string;
//   values: FacetValue[];
// }

// interface Facets {
//   categories?: Facet;
//   brand?: Facet;
//   price_range?: Facet;
//   on_sale?: Facet;
//   status?: Facet;
//   [key: string]: Facet | undefined;
// }

// interface Props {
//   facets: Facets;
//   onFilterChange?: (group: string, value: string, checked: boolean) => void;
// }

// export default function SearchFacets({ facets, onFilterChange }: Props) {
//   const [selectedFacet, setSelectedFacet] = useState<string | null>(null);
//   const [checkedItems, setCheckedItems] = useState<Record<string, string[]>>({});

//   const bottomSheetRef = useRef<BottomSheet>(null);

//   const snapPoints = useMemo(() => ['50%', '80%'], []);

//   const openFacet = useCallback((facetKey: string) => {
//     setSelectedFacet(facetKey);
//     bottomSheetRef.current?.expand();
//   }, []);

//   const handleCheckboxChange = (facetKey: string, value: string) => {
//     const current = checkedItems[facetKey] || [];
//     const isChecked = current.includes(value);
//     const updated = isChecked
//       ? current.filter((v) => v !== value)
//       : [...current, value];

//     setCheckedItems({ ...checkedItems, [facetKey]: updated });
//     if (onFilterChange) onFilterChange(facetKey, value, !isChecked);
//   };

//   const renderFacetButton = (facetKey: string, title: string) => (
//     <TouchableOpacity
//       key={facetKey}
//       style={styles.facetButton}
//       onPress={() => openFacet(facetKey)}
//     >
//       <Text style={styles.facetButtonText}>{title}</Text>
//     </TouchableOpacity>
//   );

//   const facet = selectedFacet ? facets[selectedFacet] : null;
//   const facetItems = facet?.values || [];

//   return (
//     <View style={{ flex: 1 }}>
//       {/* Horizontal ScrollView للفلترة */}
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
//         {facets.categories && renderFacetButton('categories', 'Categories')}
//         {facets.brand && renderFacetButton('brand', 'Brands')}
//         {facets.price_range && renderFacetButton('price_range', 'Price Range')}
//         {facets.on_sale && renderFacetButton('on_sale', 'On Sale')}
//         {facets.status && renderFacetButton('status', 'Availability')}
//       </ScrollView>

//       {/* Bottom Sheet */}
//       <BottomSheet
//         ref={bottomSheetRef}
//         index={-1} // يبدأ مغلق
//         snapPoints={snapPoints}
//         enablePanDownToClose
//       >
//         <View style={{ flex: 1, padding: 20 }}>
//           <Text style={styles.modalTitle}>{selectedFacet}</Text>
//           <BottomSheetFlatList
//             data={facetItems}
//             keyExtractor={(item) => item.value}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.checkboxRow}
//                 onPress={() => handleCheckboxChange(selectedFacet!, item.value)}
//               >
//                 <View
//                   style={[
//                     styles.checkboxFake,
//                     checkedItems[selectedFacet!]?.includes(item.value) && styles.checkboxChecked,
//                   ]}
//                 />
//                 <Text style={styles.checkboxLabel}>
//                   {item.value} ({item.count})
//                 </Text>
//               </TouchableOpacity>
//             )}
//           />
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => bottomSheetRef.current?.close()}
//           >
//             <Text style={styles.closeButtonText}>Show Results</Text>
//           </TouchableOpacity>
//         </View>
//       </BottomSheet>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   scroll: {
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     backgroundColor: '#f5f5f5',
//   },
//   facetButton: {
//     backgroundColor: '#fff',
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   facetButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//   },
//   checkboxRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   checkboxFake: {
//     width: 20,
//     height: 20,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     marginRight: 8,
//     backgroundColor: 'white',
//   },
//   checkboxChecked: {
//     backgroundColor: '#f87171',
//     borderColor: '#f87171',
//   },
//   checkboxLabel: {
//     fontSize: 16,
//   },
//   closeButton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 12,
//     borderRadius: 10,
//     marginTop: 15,
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Modalize } from "react-native-modalize";

interface FacetValue {
  value: string;
  count: number;
}

interface Facet {
  field: string;
  values: FacetValue[];
}

interface Facets {
  categories?: Facet;
  brand?: Facet;
  price_range?: Facet;
  on_sale?: Facet;
  status?: Facet;
  [key: string]: Facet | undefined;
}

interface Props {
  facets: Facets;
  onFilterChange?: (group: string, value: string, checked: boolean) => void;
}

export default function SearchFacets({ facets, onFilterChange }: Props) {
  const [selectedFacet, setSelectedFacet] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, string[]>>({});
  const modalRef = useRef<Modalize>(null);

  const openFacet = (facetKey: string) => {
    setSelectedFacet(facetKey);
    modalRef.current?.open();
  };

  const handleCheckboxChange = (facetKey: string, value: string) => {
    const current = checkedItems[facetKey] || [];
    const isChecked = current.includes(value);
    const updated = isChecked
      ? current.filter((v) => v !== value)
      : [...current, value];
    setCheckedItems({ ...checkedItems, [facetKey]: updated });
    if (onFilterChange) onFilterChange(facetKey, value, !isChecked);
  };

  const renderFacetButton = (facetKey: string, title: string) => (
    <TouchableOpacity
      key={facetKey}
      style={styles.facetButton}
      onPress={() => openFacet(facetKey)}
    >
      <Text style={styles.facetButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  const facet = selectedFacet ? facets[selectedFacet] : null;
  const facetItems = facet?.values || [];

  return (
    <View style={{ flex: 1 }}>
      {/* Horizontal ScrollView للفلترة */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {facets.categories && renderFacetButton("categories", "Categories")}
        {facets.brand && renderFacetButton("brand", "Brands")}
        {facets.price_range && renderFacetButton("price_range", "Price Range")}
        {facets.on_sale && renderFacetButton("on_sale", "On Sale")}
        {facets.status && renderFacetButton("status", "Availability")}
      </ScrollView>

      {/* Modalize Bottom Sheet */}
<Modalize ref={modalRef} modalHeight={500}>
  <View style={{ flex: 1, padding: 20 }}>
    <Text style={styles.modalTitle}>{selectedFacet}</Text>
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      data={facetItems}
      keyExtractor={(item) => item.value}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => handleCheckboxChange(selectedFacet!, item.value)}
        >
          <View
            style={[
              styles.checkboxFake,
              checkedItems[selectedFacet!]?.includes(item.value) && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>
            {item.value} ({item.count})
          </Text>
        </TouchableOpacity>
      )}
    />

        </View>
      </Modalize>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
  },
  facetButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  facetButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxFake: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: "white",
  },
  checkboxChecked: {
    backgroundColor: "#f87171",
    borderColor: "#f87171",
  },
  checkboxLabel: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
