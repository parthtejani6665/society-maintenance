import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Maintenance from '../models/Maintenance';
import { Op } from 'sequelize';
import sequelize from '../config/database';

export const createExpense = async (req: Request, res: Response) => {
    try {
        const { title, amount, category, date, description, paymentMethod, gstAmount, tdsAmount, invoiceUrl } = req.body;

        const newExpense = await Expense.create({
            title,
            amount,
            category,
            date,
            description,
            paymentMethod,
            gstAmount: gstAmount || 0,
            tdsAmount: tdsAmount || 0,
            invoiceUrl,
            isVerified: true // Auto-verify for now since only admins add it
        } as any);

        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getExpenses = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, category } = req.query;
        let whereClause: any = {};

        if (startDate && endDate) {
            whereClause.date = {
                [Op.between]: [startDate, endDate]
            };
        }

        if (category && category !== 'All') {
            whereClause.category = category;
        }

        const expenses = await Expense.findAll({
            where: whereClause,
            order: [['date', 'DESC']]
        });

        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAnalytics = async (req: Request, res: Response) => {
    try {
        // Total Expenses
        const totalExpenses = await Expense.sum('amount');

        // Total Income (Maintenance Collected)
        const totalIncome = await Maintenance.sum('amount', {
            where: { status: 'paid' }
        });

        // Category-wise split
        const categorySplit = await Expense.findAll({
            attributes: [
                'category',
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            group: ['category']
        });

        // Recent limit 5
        const recentExpenses = await Expense.findAll({
            limit: 5,
            order: [['date', 'DESC']]
        });

        res.json({
            total: totalExpenses || 0,
            income: totalIncome || 0,
            byCategory: categorySplit,
            recent: recentExpenses
        });
    } catch (error) {
        console.error('Error fetching expense analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteExpense = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findByPk(id as string);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        await expense.destroy();
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
