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
import { WasteLog, deleteWasteLog, getWasteLogById, updateWasteLog } from '@/api/functions';
import { useAlert } from '@/hooks/alertContext';

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
            showAlert({ title: 'Error', message: 'Failed to fetch log details.', confirmText: 'OK' });
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
            showAlert({ title: 'Error', message: 'Failed to delete waste log.', confirmText: 'OK' });
        } finally {
            setIsLoading(false);
        }
    };

    const showDeleteConfirmation = () => {
        showAlert({
            title: 'Delete Log',
            message: 'Are you sure you want to delete this log entry?',
            confirmText: 'Delete',
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
            showAlert({ title: 'Success', message: 'Waste log updated successfully.', confirmText: 'OK' });
            setIsEditing(false);
            fetchLogDetails();
        } catch (error) {
            showAlert({ title: 'Error', message: 'Failed to update waste log.', confirmText: 'OK' });
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
                    <Text style={styles.headerTitle}>Details</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text>Waste log not found</Text>
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
                <Text style={styles.headerTitle}>Log Details</Text>
                <View style={styles.headerSpacer} />
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.title}>{log.sub_category_name}</Text>
                        <Text style={styles.score}>+{log.score} pts</Text>
                    </View>

                    <View style={styles.details}>
                        <View style={styles.detailRow}>
                            <View style={styles.labelContainer}><Ionicons name="scale-outline" size={20} color={colors.textSecondary} /><Text style={styles.label}>Quantity</Text></View>
                            {isEditing ? (<TextInput style={styles.input} value={editedQuantity} onChangeText={setEditedQuantity} keyboardType="decimal-pad" />)
                                : (<Text style={styles.value}>{log.quantity} {log.unit}</Text>)}
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.labelContainer}><Ionicons name="calendar-outline" size={20} color={colors.textSecondary} /><Text style={styles.label}>Date Logged</Text></View>
                            <Text style={styles.value}>{new Date(log.date_logged).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.labelContainer}><Ionicons name="checkmark-circle-outline" size={20} color={colors.textSecondary} /><Text style={styles.label}>Disposal Date</Text></View>
                            {isEditing ? (<TextInput style={styles.input} value={editedDisposalDate} onChangeText={setEditedDisposalDate} placeholder="YYYY-MM-DD" />)
                                : (<Text style={styles.value}>{log.disposal_date ? new Date(log.disposal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified'}</Text>)}
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.labelContainer}><Ionicons name="location-outline" size={20} color={colors.textSecondary} /><Text style={styles.label}>Location</Text></View>
                            {isEditing ? (<TextInput style={styles.input} value={editedLocation} onChangeText={setEditedLocation} />)
                                : (<Text style={styles.value}>{log.disposal_location || 'Not specified'}</Text>)}
                        </View>
                    </View>
                </View>

                <View style={styles.actions}>
                    {isEditing ? (
                        <>
                            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave} disabled={isLoading}>
                                {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={showDeleteConfirmation}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => setIsEditing(true)}>
                                <Ionicons name="pencil-outline" size={20} color={colors.primary} />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}