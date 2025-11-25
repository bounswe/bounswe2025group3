import { useColors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWasteLogs, WasteLog } from '@/api/waste';
import { useTranslation } from 'react-i18next';

export default function GalleryScreen() {
    const [logs, setLogs] = useState<WasteLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const colors = useColors();
    const { t } = useTranslation();
    const numColumns = 3;
    const screenWidth = Dimensions.get('window').width;
    const imageSize = (screenWidth - 40) / numColumns; // 40 for padding

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
        header: { height: "7%", paddingHorizontal: "4%", paddingTop: "2%", flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borders },
        backButton: { padding: 4 },
        title: { marginLeft: "5%", fontSize: 24, fontWeight: '600', color: colors.primary },
        content: { flex: 1, padding: 10 },
        imageContainer: { margin: 5, borderRadius: 8, overflow: 'hidden' },
        image: { width: imageSize, height: imageSize },
        emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: "50%" },
        emptyStateText: { fontSize: 16, color: colors.textSecondary, marginTop: 16 },
    });

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getWasteLogs();
                // Filter logs that have a photo
                const logsWithPhotos = data.filter(log => log.disposal_photo);
                setLogs(logsWithPhotos);
            } catch (error) {
                console.error('Failed to fetch logs for gallery:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const renderItem = ({ item }: { item: WasteLog }) => (
        <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => router.push(`/waste/${item.id}`)}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: item.disposal_photo }}
                style={styles.image}
                contentFit="cover"
                transition={200}
            />
        </TouchableOpacity>
    );

    if (isLoading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t("waste.gallery")}</Text>
            </View>

            <View style={styles.content}>
                {logs.length > 0 ? (
                    <FlatList
                        data={logs}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={numColumns}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="images-outline" size={48} color={colors.textSecondary} />
                        <Text style={styles.emptyStateText}>{t("waste.no_photos")}</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
