import { useColors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WasteLog, deleteWasteLog, getWasteLogById, updateWasteLog } from '@/api/waste';
import { useAlert } from '@/hooks/alertContext';
import { useTranslation } from 'react-i18next';
import { formatDateShort } from "@/i18n/utils";
import { Image } from 'expo-image';

export default function WasteLogDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [log, setLog] = useState<WasteLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuantity, setEditedQuantity] = useState('');
    const [editedLocation, setEditedLocation] = useState('');
    const [editedDisposalDate, setEditedDisposalDate] = useState('');
    const router = useRouter();
    const colors = useColors();
    const { showAlert, hideAlert, isVisible } = useAlert();
    const { t } = useTranslation();

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, },
        headerBar: {
            height: "7%",
            paddingHorizontal: "4%",
            paddingTop: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.borders
        },
        backButton: {
            padding: 4
        },
        headerTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            color: colors.text,
            marginLeft: 12
        },
        headerSpacer: {
            flex: 1
        },
        content: { padding: 20, },
        card: { backgroundColor: colors.cb1, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.borders, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3, },
        cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.borders, paddingBottom: 16, },
        title: { fontSize: 22, fontWeight: '600', color: colors.text, },
        score: { fontSize: 18, color: colors.primary, fontWeight: 'bold', },
        details: { gap: 16, },
        detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 40, },
        labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, },
        label: { fontSize: 16, color: colors.textSecondary, },
        value: { fontSize: 16, fontWeight: '500', color: colors.text, flex: 1, textAlign: 'right', },
        input: { borderWidth: 1, borderColor: colors.borders, borderRadius: 8, padding: 10, minWidth: 150, fontSize: 16, backgroundColor: colors.background, textAlign: 'right', color: colors.text },
        actions: { flexDirection: 'row', gap: 12, },
        actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8, },
        editButton: { backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.primary },
        editButtonText: { color: colors.primary, fontWeight: 'bold' },
        deleteButton: { backgroundColor: colors.cb1, borderWidth: 1, borderColor: colors.error },
        deleteButtonText: { color: colors.error, fontWeight: 'bold' },
        saveButton: { backgroundColor: colors.primary },
        saveButtonText: { color: 'white', fontWeight: 'bold' },
        cancelButton: { backgroundColor: colors.borders, },
        cancelButtonText: { color: colors.text, fontWeight: 'bold' },
        imageContainer: { marginTop: 16, borderRadius: 12, overflow: 'hidden', height: 200, width: '100%', backgroundColor: colors.cb2 },
        logImage: { width: '100%', height: '100%' },
    });

    useEffect(() => {
        const onBackPress = () => {
            if (isVisible) {
                hideAlert();
                return true;
            }
            return false;
        };
        const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => subscription.remove();
    }, [isVisible, hideAlert]);

    useEffect(() => {
        if (id) {
            fetchLogDetails();
        }
    }, [id]);

    const fetchLogDetails = async () => {
        setIsLoading(true);
        try {
            const data = await getWasteLogById(Number(id));
            setLog(data);
            setEditedQuantity(data.quantity.toString());
            setEditedLocation(data.disposal_location || '');
            setEditedDisposalDate(data.disposal_date || '');
        } catch (error) {
            console.error('Error fetching waste log details:', error);
            showAlert({ title: t("waste.error_title"), message: t("waste.fetch_details_error"), confirmText: t("waste.ok") });
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = async () => {
        hideAlert();
        setIsLoading(true);
        try {
            await deleteWasteLog(Number(id));
            router.back();
        } catch (error) {
            showAlert({ title: t("waste.error_title"), message: t("waste.delete_log_error"), confirmText: t("waste.ok") });
        } finally {
            setIsLoading(false);
        }
    };

    const showDeleteConfirmation = () => {
        showAlert({
            title: t("waste.delete_log_title"),
            message: t("waste.delete_log_message"),
            confirmText: t("waste.delete"),
            onConfirm: confirmDelete,
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateWasteLog(Number(id), {
                quantity: parseFloat(editedQuantity),
                disposal_location: editedLocation || undefined,
                disposal_date: editedDisposalDate || undefined,
            });
            showAlert({ title: t("waste.success_title"), message: t("waste.update_success"), confirmText: t("waste.ok") });
            setIsEditing(false);
            fetchLogDetails();
        } catch (error) {
            showAlert({ title: t("waste.error_title"), message: t("waste.update_error"), confirmText: t("waste.ok") });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (log) {
            setEditedQuantity(log.quantity.toString());
            setEditedLocation(log.disposal_location || '');
            setEditedDisposalDate(log.disposal_date || '');
        }
    };

    if (isLoading && !log) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!log) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.headerBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t("waste.details")}</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text>{t("waste.log_not_found")}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t("waste.log_details")}</Text>
                <View style={styles.headerSpacer} />
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.title}>{log.sub_category_name}</Text>
                        <Text style={styles.score}>+{log.score} {t("leaderboard.pts")}</Text>
                    </View>

                    <View style={styles.details}>
                        <View style={styles.detailRow}>
                            <View style={styles.labelContainer}><Ionicons name="scale-outline" size={20} color={colors.textSecondary} /><Text style={styles.label}>{t("waste.quantity_label")}</Text></View>
                            {isEditing ? (<TextInput style={styles.input} value={editedQuantity} onChangeText={setEditedQuantity} keyboardType="decimal-pad" />)
                                : (<Text style={styles.value}>{log.quantity} {log.unit}</Text>)}
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.labelContainer}><Ionicons name="calendar-outline" size={20} color={colors.textSecondary} /><Text style={styles.label}>{t("waste.date_logged")}</Text></View>
                            <Text style={styles.value}>{formatDateShort(log.date_logged)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.labelContainer}><Ionicons name="checkmark-circle-outline" size={20} color={colors.textSecondary} /><Text style={styles.label}>{t("waste.disposal_date")}</Text></View>
                            {isEditing ? (<TextInput style={styles.input} value={editedDisposalDate} onChangeText={setEditedDisposalDate} placeholder="YYYY-MM-DD" />)
                                : (<Text style={styles.value}>{log.disposal_date ? formatDateShort(log.disposal_date) : t("waste.not_specified")}</Text>)}
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.labelContainer}><Ionicons name="location-outline" size={20} color={colors.textSecondary} /><Text style={styles.label}>{t("waste.location")}</Text></View>
                            {isEditing ? (<TextInput style={styles.input} value={editedLocation} onChangeText={setEditedLocation} />)
                                : (<Text style={styles.value}>{log.disposal_location || t("waste.not_specified")}</Text>)}
                        </View>

                        {log.disposal_photo && (
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: log.disposal_photo }} style={styles.logImage} contentFit="cover" />
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.actions}>
                    {isEditing ? (
                        <>
                            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel}>
                                <Text style={styles.cancelButtonText}>{t("waste.cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave} disabled={isLoading}>
                                {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>{t("waste.save_changes")}</Text>}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={showDeleteConfirmation}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                                <Text style={styles.deleteButtonText}>{t("waste.delete")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => setIsEditing(true)}>
                                <Ionicons name="pencil-outline" size={20} color={colors.primary} />
                                <Text style={styles.editButtonText}>{t("waste.edit")}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}