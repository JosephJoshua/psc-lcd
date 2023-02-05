import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, UIManager } from 'react-native';
import useDebounce from '@/hooks/useDebounce';
import useUser from '@/hooks/useUser';
import { collections } from '@/lib/firebase';
import Category from '@/types/category';
import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import {
  arrayRemove,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import Fuse from 'fuse.js';
import {
  Actionsheet,
  Box,
  HStack,
  Icon,
  IconButton,
  Input,
  KeyboardAvoidingView,
  Pressable,
  Text,
  VStack,
  useToken,
} from 'native-base';

import AddScreenModal from '../../modals/AddScreenModal';

type ListItem = {
  type: 'row' | 'sectionHeader';
  categoryId: string;
  value: string;
  matchRanges?: Fuse.RangeTuple[];
};

/**
 * @see https://reactnative.dev/docs/layoutanimation
 */
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental != null
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HomeScreen: FC = () => {
  const user = useUser();
  const primaryColor = useToken('colors', 'primary.500') as string;

  const [rawData, setRawData] = useState<Category[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );

  const [categoriesDeleting, setCategoriesDeleting] = useState<Set<string>>(
    new Set(),
  );

  const [screensDeleting, setScreensDeleting] = useState<Set<string>>(
    new Set(),
  );

  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  const listRef = useRef<FlashList<ListItem> | null>(null);
  const debouncedSearchText = useDebounce(searchText, 100);

  const fuse = useMemo(
    () =>
      new Fuse(rawData, {
        shouldSort: true,
        ignoreLocation: true,
        isCaseSensitive: false,
        includeScore: true,
        includeMatches: true,
        useExtendedSearch: true,
        findAllMatches: true,
        threshold: 0.5,
        keys: [
          { name: 'name', weight: 0.3 },
          { name: 'screens', weight: 0.7 },
        ],
      }),
    [rawData],
  );

  const listData = useMemo(() => {
    /**
     * Return the entire data instead
     * if the search text is empty.
     */
    const toSearch =
      debouncedSearchText.trim().length === 0
        ? rawData.map<Fuse.FuseResult<Category>>((cat, idx) => ({
            item: cat,
            score: 1,
            refIndex: idx,
          }))
        : fuse.search(debouncedSearchText);

    return toSearch.reduce<ListItem[]>((acc, curr) => {
      const data = curr.item;
      const screenMatchesArr =
        curr.matches?.filter((match) => match.key === 'screens') ?? [];

      const screenMatches = Object.fromEntries(
        screenMatchesArr.map((match) => [
          match.value ?? '',
          [...match.indices],
        ]),
      );

      const category: ListItem = {
        type: 'sectionHeader',
        value: data.name,
        categoryId: data.id,
      };

      const screens = data.screens.map<ListItem>((screen) => ({
        type: 'row',
        value: screen,
        matchRanges: screenMatches[screen],
        categoryId: data.id,
      }));

      /**
       * Sort the screens so that the ones that are a match
       * are above the ones that aren't.
       */
      screens.sort(
        ({ matchRanges: a }: ListItem, { matchRanges: b }: ListItem) => {
          const getValue = (val: unknown) => (val == null ? -1 : 1);
          const result = getValue(b) - getValue(a);

          /**
           * If they are both a match (or both *not* a match),
           * we compare them based on how many characters
           * in the string they're matched at.
           */
          if (result === 0) {
            const getPseudoScore = (ranges: Fuse.RangeTuple[]) => {
              return ranges.reduce<number>((acc, curr) => {
                return acc + (curr[1] - curr[0]) + 1;
              }, 0);
            };

            return getPseudoScore(b ?? []) - getPseudoScore(a ?? []);
          }

          return result;
        },
      );

      return acc.concat([category, ...screens]);
    }, []);
  }, [fuse, debouncedSearchText]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collections.categories, orderBy('name')),
      (snapshot) => {
        setRawData(
          snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })),
        );
      },
    );

    return () => unsubscribe();
  }, []);

  type MatchRange = {
    indices: Fuse.RangeTuple;
    isMatch: boolean;
  };

  const splitStrRanges = (
    str: string,
    ranges: Fuse.RangeTuple[],
  ): MatchRange[] => {
    const result: MatchRange[] = [];
    let i = 0;

    /**
     * Sort the range by the start and then the
     * end if the start is the same (shouldn't happen).
     */
    ranges.sort(([a, b], [c, d]) => a - c || d - b);

    ranges.forEach((range) => {
      const right = Math.max(0, range[0] - 1);

      if (i <= right && right < range[0])
        result.push({
          indices: [i, right],
          isMatch: false,
        });

      if (range.every((p) => p < str.length))
        result.push({
          indices: range,
          isMatch: true,
        });

      i = range[1] + 1;
    });

    if (i < str.length)
      result.push({
        indices: [i, str.length - 1],
        isMatch: false,
      });

    return result;
  };

  const toggleCollapse = (categoryId: string) => {
    setCollapsedCategories((val) => {
      const newVal = new Set(val);

      if (newVal.has(categoryId)) {
        newVal.delete(categoryId);
      } else {
        newVal.add(categoryId);
      }

      return newVal;
    });
  };

  const getScreensDeletingKey = (categoryId: string, screen: string) => {
    return `${categoryId}-${screen}`;
  };

  const deleteCategory = async (categoryId: string) => {
    setCategoriesDeleting((val) => {
      return new Set(val).add(categoryId);
    });

    return deleteDoc(doc(collections.categories, categoryId)).finally(() => {
      setCategoriesDeleting((val) => {
        const newVal = new Set(val);
        newVal.delete(categoryId);

        return newVal;
      });
    });
  };

  const deleteScreen = async (categoryId: string, screen: string) => {
    const key = getScreensDeletingKey(categoryId, screen);

    setScreensDeleting((val) => {
      return new Set(val).add(key);
    });

    return updateDoc(doc(collections.categories, categoryId), {
      screens: arrayRemove(screen),
    }).finally(() => {
      setScreensDeleting((val) => {
        const newVal = new Set(val);
        newVal.delete(key);

        return newVal;
      });
    });
  };

  return (
    <VStack flex={1} alignItems="center" pb="6" safeArea>
      <Input
        mt="4"
        mx="4"
        mb="2"
        py="2"
        fontSize="md"
        placeholder="Cari..."
        value={searchText}
        onChangeText={setSearchText}
        backgroundColor="white"
        type="text"
        autoCapitalize="none"
        autoCorrect={false}
        rightElement={
          <Icon as={Feather} name="search" size="md" color="gray.50" />
        }
      />

      <Box flex={1} alignSelf="stretch">
        <FlashList
          ref={listRef}
          extraData={[collapsedCategories, screensDeleting, user?.role]}
          keyExtractor={(item) => `${item.categoryId}-${item.value}`}
          renderItem={({ item }) => {
            const isCollapsed = collapsedCategories.has(item.categoryId);

            if (item.type === 'sectionHeader') {
              return (
                <Pressable onPress={() => toggleCollapse(item.categoryId)}>
                  <HStack
                    mx="6"
                    mt="4"
                    mb="2"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <HStack alignItems="center">
                      <Text
                        fontSize="xl"
                        fontWeight="medium"
                        color="primary.500"
                      >
                        {item.value}
                      </Text>

                      {user?.role === 'admin' && (
                        <IconButton
                          ml="1"
                          icon={
                            categoriesDeleting.has(item.categoryId) ? (
                              <ActivityIndicator
                                color={primaryColor}
                                size={14}
                              />
                            ) : (
                              <Icon
                                as={Feather}
                                name="trash"
                                color="primary.500"
                                size="sm"
                              />
                            )
                          }
                          onPress={() => deleteCategory(item.categoryId)}
                          rounded="full"
                          _pressed={{
                            backgroundColor: 'gray.100',
                          }}
                        />
                      )}
                    </HStack>

                    <Icon
                      as={Feather}
                      name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                      size="md"
                      color="gray.600"
                    />
                  </HStack>
                </Pressable>
              );
            }

            if (isCollapsed) return null;

            return (
              <HStack justifyContent="space-between" pr="3">
                <HStack mx="6" mb="1" height="9">
                  {splitStrRanges(item.value, item.matchRanges ?? []).map(
                    ({ indices: [start, end], isMatch }) => {
                      return (
                        <Text
                          key={`${item.value}-${start}-${end}`}
                          color={isMatch ? 'amber.600' : 'black'}
                          fontWeight={isMatch ? 'medium' : 'normal'}
                          fontSize="md"
                        >
                          {item.value.substring(start, end + 1)}
                        </Text>
                      );
                    },
                  )}
                </HStack>

                {user?.role === 'admin' && (
                  <IconButton
                    variant="ghost"
                    rounded="full"
                    icon={
                      screensDeleting.has(
                        getScreensDeletingKey(item.categoryId, item.value),
                      ) ? (
                        <ActivityIndicator color={primaryColor} size={14} />
                      ) : (
                        <Icon as={Feather} name="trash" size="sm" />
                      )
                    }
                    onPress={() => {
                      void deleteScreen(item.categoryId, item.value);
                    }}
                    _pressed={{
                      backgroundColor: 'gray.100',
                    }}
                  />
                )}
              </HStack>
            );
          }}
          data={listData}
          getItemType={(item) => item.type}
          estimatedItemSize={20}
        />
      </Box>

      <Actionsheet
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        size="full"
      >
        <KeyboardAvoidingView behavior="padding" width="full">
          <Actionsheet.Content>
            <AddScreenModal onClose={() => setAddModalOpen(false)} />
          </Actionsheet.Content>
        </KeyboardAvoidingView>
      </Actionsheet>

      {user?.role === 'admin' && (
        <IconButton
          onPress={() => setAddModalOpen(true)}
          icon={<Icon as={Feather} name="plus" size="xl" color="white" />}
          size="16"
          backgroundColor="primary.500"
          rounded="full"
          shadow="5"
        />
      )}
    </VStack>
  );
};

export default HomeScreen;
