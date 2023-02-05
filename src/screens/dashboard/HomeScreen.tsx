import { FC, useEffect, useMemo, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';
import useUser from '@/hooks/useUser';
import { collections } from '@/lib/firebase';
import CategoryEntryModal from '@/modals/CategoryEntryModal';
import ScreenEntryModal from '@/modals/ScreenEntryModal';
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
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  VStack,
} from 'native-base';

type ListItem = {
  type: 'row' | 'sectionHeader';
  categoryId: string;
  value: string;
  matchRanges?: Fuse.RangeTuple[];
};

type ScreenIdentifier = {
  categoryId: string;
  screen: string;
};

type CategoryToEdit = {
  id: string;
  name: string;
};

const HomeScreen: FC = () => {
  const user = useUser();

  const [rawData, setRawData] = useState<Category[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [screenToDelete, setScreenToDelete] = useState<ScreenIdentifier | null>(
    null,
  );

  const [screenToEdit, setScreenToEdit] = useState<ScreenIdentifier | null>(
    null,
  );

  const [categoryToEdit, setCategoryToEdit] = useState<CategoryToEdit | null>(
    null,
  );

  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

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

  const deleteCategory = async (categoryId: string) => {
    setIsDeleting(true);
    return deleteDoc(doc(collections.categories, categoryId)).finally(() => {
      setIsDeleting(false);
    });
  };

  const deleteScreen = async ({ categoryId, screen }: ScreenIdentifier) => {
    setIsDeleting(true);

    return updateDoc(doc(collections.categories, categoryId), {
      screens: arrayRemove(screen),
    }).finally(() => setIsDeleting(false));
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
          extraData={[collapsedCategories, user?.role]}
          keyExtractor={(item) => `${item.categoryId}-${item.value}`}
          ListEmptyComponent={
            <VStack justifyContent="center" alignItems="center" mt="16">
              <Icon
                as={Feather}
                name="alert-triangle"
                color="primary.500"
                size="4xl"
              />

              <Text fontSize="lg" color="primary.500" mt="1">
                Tidak dapat menemukan data!
              </Text>
            </VStack>
          }
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
                          ml="2"
                          icon={
                            <Icon
                              as={Feather}
                              name="edit-3"
                              color="primary.500"
                              size="sm"
                            />
                          }
                          onPress={() =>
                            setCategoryToEdit({
                              id: item.categoryId,
                              name: item.value,
                            })
                          }
                          rounded="full"
                          _pressed={{
                            backgroundColor: 'white',
                          }}
                        />
                      )}

                      {user?.role === 'admin' && (
                        <IconButton
                          ml="1.5"
                          px="0"
                          icon={
                            <Icon
                              as={Feather}
                              name="trash"
                              color="primary.500"
                              size="sm"
                            />
                          }
                          onPress={() => setCategoryToDelete(item.categoryId)}
                          rounded="full"
                          _pressed={{
                            backgroundColor: 'white',
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

                <HStack>
                  {user?.role === 'admin' && (
                    <IconButton
                      icon={
                        <Icon
                          as={Feather}
                          name="edit-3"
                          color="primary.500"
                          size="sm"
                        />
                      }
                      onPress={() =>
                        setScreenToEdit({
                          categoryId: item.categoryId,
                          screen: item.value,
                        })
                      }
                      rounded="full"
                      _pressed={{
                        backgroundColor: 'white',
                      }}
                    />
                  )}

                  {user?.role === 'admin' && (
                    <IconButton
                      variant="ghost"
                      rounded="full"
                      icon={<Icon as={Feather} name="trash" size="sm" />}
                      onPress={() =>
                        setScreenToDelete({
                          categoryId: item.categoryId,
                          screen: item.value,
                        })
                      }
                      _pressed={{
                        backgroundColor: 'white',
                      }}
                    />
                  )}
                </HStack>
              </HStack>
            );
          }}
          data={listData}
          getItemType={(item) => item.type}
          estimatedItemSize={20}
        />
      </Box>

      <Actionsheet
        isOpen={addModalOpen || screenToEdit != null}
        onClose={() => {
          setAddModalOpen(false);
          setScreenToEdit(null);
        }}
        size="full"
      >
        <KeyboardAvoidingView behavior="padding" width="full">
          <Actionsheet.Content>
            <ScreenEntryModal
              type={addModalOpen ? 'add' : 'edit'}
              initialValues={
                screenToEdit == null
                  ? undefined
                  : {
                      categoryId: screenToEdit.categoryId,
                      name: screenToEdit.screen,
                    }
              }
              onClose={() => {
                setAddModalOpen(false);
                setScreenToEdit(null);
              }}
            />
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

      <Actionsheet
        isOpen={categoryToEdit != null}
        onClose={() => setCategoryToEdit(null)}
        size="full"
      >
        <KeyboardAvoidingView behavior="padding" width="full">
          <Actionsheet.Content>
            {categoryToEdit != null && (
              <CategoryEntryModal
                type="edit"
                categoryId={categoryToEdit.id}
                initialValues={categoryToEdit}
                onClose={() => setCategoryToEdit(null)}
              />
            )}
          </Actionsheet.Content>
        </KeyboardAvoidingView>
      </Actionsheet>

      <Modal
        isOpen={screenToDelete != null}
        onClose={() => setScreenToDelete(null)}
      >
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Hapus Layar</Modal.Header>
          <Modal.Body>Apakah Anda yakin ingin menghapus layar ini?</Modal.Body>
          <Modal.Footer>
            <Button.Group>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setScreenToDelete(null)}
              >
                Batal
              </Button>

              <Button
                isLoading={isDeleting}
                onPress={() => {
                  if (screenToDelete == null) return;

                  deleteScreen(screenToDelete).finally(() =>
                    setScreenToDelete(null),
                  );
                }}
              >
                Hapus
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      <Modal
        isOpen={categoryToDelete != null}
        onClose={() => setCategoryToDelete(null)}
      >
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Hapus Kategori</Modal.Header>
          <Modal.Body>
            Apakah Anda yakin ingin menghapus kategori ini? Semua layar di bawah
            kategori ini juga akan ikut terhapus.
          </Modal.Body>
          <Modal.Footer>
            <Button.Group>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setCategoryToDelete(null)}
              >
                Batal
              </Button>

              <Button
                isLoading={isDeleting}
                onPress={() => {
                  if (categoryToDelete == null) return;

                  deleteCategory(categoryToDelete).finally(() =>
                    setCategoryToDelete(null),
                  );
                }}
              >
                Hapus
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </VStack>
  );
};

export default HomeScreen;
